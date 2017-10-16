import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.gen
import os
import json
import traceback
from motor import motor_tornado
from passlib.hash import pbkdf2_sha256
from tornado.options import define, options
import requests
import xml.etree.ElementTree as ET
define("port", default=8000, help="run on the given port", type=int)


class MyAppException(tornado.web.HTTPError):
    pass


class BaseHandler(tornado.web.RequestHandler):
    # def get_current_user(self):
    # self.get_secure_cookie("user")
    def get_current_user(self):
        return self.get_secure_cookie("user")

    def db(self):
        Client = self.settings['db_client']
        db = Client.tornado
        return db

    @staticmethod
    def get_user_data(username):
        link = "https://myanimelist.net/malappinfo.php?u=" + username + "&status=all&type=anime"
        resp = requests.get(link).text
        tree = ET.fromstring(resp)
        return tree

    def write_error(self, status_code, **kwargs):
        # self.set_header('Content-Type', 'application/json')
        if self.settings.get("serve_traceback") and "exc_info" in kwargs:
            # in debug mode, try to send a traceback
            lines = []
            for line in traceback.format_exception(*kwargs["exc_info"]):
                lines.append(line)
            self.render("error.html", d=json.dumps({
                    'error': {
                        'code': status_code,
                        'message': self._reason,
                        'traceback': lines,
                    }
                }), page=None)
        else:
            self.render("error.html", d=json.dumps({
                'error': {
                    'code': status_code,
                    'message': self._reason,
                    }
                }), page=None)


class IndexHandler(BaseHandler):
    def get(self):
        self.render("home.html")


class SignupHandler(BaseHandler):
    def get(self):
        self.render("Signup.html")

    @tornado.gen.coroutine
    def post(self, *args, **kwargs):
        password = self.get_argument("pass")
        details = {
            "fname": self.get_argument("fname"),
            "lname": self.get_argument("lname"),
            "email": self.get_argument("email"),
        }
        dbc = self.db()
        auth = dbc.auth
        user_details = dbc.user_details
        find_email = yield user_details.find_one({"email": details["email"]})

        if find_email:
            self.render("error.html", d=json.dumps({
                "error": {
                    "code": 400,
                    "message": "Username exists."
                }
            }))
            return
        username = details["email"]
        hash_pass = pbkdf2_sha256.hash(password)
        auth.insert_one({"user": username, "pass": hash_pass})
        user_details.insert_one(details)
        self.set_secure_cookie("user", username)
        self.redirect("/search")


class AnimeHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        username = self.get_argument("search")
        tree = self.get_user_data(username)
        self.render("anime.html", xml_data=tree)


class SearchHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("search.html")


class my404handler(BaseHandler):
    def get(self):
        self.render("error.html", d=json.dumps({
            'error': {
                'code': 404,
                'message': 'Page not found.'
            }
        }))


class LogoutHandler(BaseHandler):
    def get(self):
        if bool(self.get_secure_cookie('user')):
            self.clear_cookie('user')
        self.redirect('/')


class LoginHandler(BaseHandler):
    def get(self):
        if self.get_current_user():
            self.redirect("/search")
            return
        self.render("login.html")

    @tornado.gen.coroutine
    def post(self, *args, **kwargs):
        username = self.get_argument("user")
        password = self.get_argument("pass")
        dbc = self.db()
        auth = dbc.auth
        find = yield auth.find_one({"user": username})
        if not find:
            self.render("error.html", d=json.dumps({
                "error": {
                    "code": 400,
                    "message": "Invalid credentials"
                }}))
            return

        cred = pbkdf2_sha256.verify(password, find["pass"])

        if not cred:
            self.render("error.html", d=json.dumps({
                "error":{
                "code": 400,
                "message": "Invalid Credentials"
            }}))
            return

        self.set_secure_cookie("user", username)
        self.redirect("/search")

if __name__ == "__main__":
    tornado.options.parse_command_line()
    client = motor_tornado.MotorClient("mongodb://"+os.environ['dbuser']+":"+os.environ['dbpass']+"@ds117605.mlab.com:17605/tornado")
    settings = {
        "default_handler_class": my404handler,
        "debug": True,
        "cookie_secret": os.environ['cookie_secret'],
        "login_url": "/login",
        "db_client": client
    }
    app = tornado.web.Application(
        handlers=[
            (r"/", IndexHandler),
            (r"/login", LoginHandler),
            (r"/Signup", SignupHandler),
            (r"/anime", AnimeHandler),
            (r"/search", SearchHandler),
            (r"/logout", LogoutHandler)
        ],
        **settings,
        template_path=os.path.dirname(__file__),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
    )
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
