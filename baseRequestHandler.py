__author__ = 'vjmor_000'

import os

from google.appengine.api import users

from ndbEntityDefs import Character

import jinja2
import webapp2
from ConfigParser import ConfigParser


class BaseRequestHandler(webapp2.RequestHandler):

    CONFIG_FILE = ConfigParser()
    CONFIG_FILE.read("config.ini")

    USERNAME_WHITELIST = str(CONFIG_FILE.get("Users", 'userWhitelist')).split(',')

    ADMIN_WHITELIST = str(CONFIG_FILE.get("Users", 'adminWhitelist')).split(',')

    JINJA_ENVIRONMENT = jinja2.Environment(
        loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
        extensions=['jinja2.ext.autoescape'])

    def get(self):
        if users.get_current_user():
            user = users.get_current_user()
            if self.IsUserInWhitelist(user):
                self.RenderSuccess()
            else:
                self.RenderFailure()
        else:
            self.RenderFailure()

    def post(self):
        self.ProcessPostMessage()

    def RenderSuccess(self):
        url = users.create_logout_url(self.request.uri)
        url_linktext = 'Logout'
        PAGE_DESCRIPTION = 'Welcome Back ' + users.get_current_user().nickname()
        user = users.get_current_user()
        template_values = {
            'titleDesc': PAGE_DESCRIPTION,
            'url': url,
            'url_linktext': url_linktext,
            'user': user,
            'character': Character.GetCharacterByUser(user),
        }
        self.RenderTemplate("index", template_values)

    def RenderFailure(self):
        url = users.create_login_url(self.request.uri)
        url_linktext = 'Login'
        PAGE_DESCRIPTION = 'Please Login'
        template_values = {
            'titleDesc': PAGE_DESCRIPTION,
            'url': url,
            'url_linktext': url_linktext,
        }
        self.RenderTemplate("login", template_values)

    def ProcessPostMessage(self):
        for arg in self.request.arguments():
            print self.request.get(arg)
        self.response.write("SUCCESS")

    def IsUserInWhitelist(self, user):
        return True
        '''
        character = Character.GetCharacterByUser(user)
        if character.username == "GUEST" or character.isUnderReview:
            return False
        return True

        if "@mail.chapman.edu".upper() not in user.email().upper():
            if not any(username in user.email().upper() for username in [x.upper() for x in self.USERNAME_WHITELIST]):
                return False
        return True'''

    def IsUserInAdminWhitelist(self, user):
        #print self.ADMIN_WHITELIST
        if not any(username in user.email().upper() for username in [x.upper() for x in self.ADMIN_WHITELIST]):
                return False
        return True

    def RenderGuest(self):
        url = users.create_logout_url(self.request.uri)
        url_linktext = 'Logout'

        template_values = {
            'titleDesc': "Invalid User",
            'url': url,
            'url_linktext': url_linktext,
        }
        self.RenderTemplate("invalidUserCharacter", template_values)

    def RenderTemplate(self, templateName, templateVars={}):
        template = self.JINJA_ENVIRONMENT.get_template('templates/' + templateName + '.html')
        self.response.write(template.render(templateVars))

    @classmethod
    def handle_404(cls, request, response, exception):
        template = BaseRequestHandler.JINJA_ENVIRONMENT.get_template('templates/' + "404" + '.html')
        response.write(template.render({'message': "Oops! I could swear this page was here!"}))
        response.set_status(404)

    @classmethod
    def handle_500(cls, request, response, exception):
        print exception
        template = BaseRequestHandler.JINJA_ENVIRONMENT.get_template('templates/' + "500" + '.html')
        response.write(template.render({'message': "Oops! Something really BAD has occurred!"}))
        response.set_status(500)