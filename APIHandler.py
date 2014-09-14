__author__ = 'vjmor_000'

from baseRequestHandler import BaseRequestHandler
from google.appengine.api import users
from ndbEntityDefs import *
import inspect
import json
import sys


class ApiHandler(BaseRequestHandler):
    ApiLambda = lambda member: type(member) is not str and 'api' in member.__name__.lower()

    def get(self):
        splitPath = [value for value in self.request.path.split('/') if not value == ""]
        splitPath.pop(0)
        ApiLambda = lambda member: hasattr(member, "__name__") and 'api' in member.__name__.lower()
        validAPICalls = inspect.getmembers(self, inspect.ismethod and ApiLambda)
        requestedAPI = ""
        if len(splitPath) > 0:
            requestedAPI = splitPath[0]
            if not requestedAPI.startswith('_'):
                foundAPI = [api for api in validAPICalls if api[0].lower().replace("api", "") == requestedAPI.lower()]
                if len(foundAPI) > 0:
                    foundAPI[0][1]()
                    return
        self.RenderJson({'error': 'No Such API Found', 'validAPIs': [api[0] for api in validAPICalls if not api[0].startswith('_')], 'sentAPI': requestedAPI}, True)

    def RenderSuccess(self):
        self.response.write("")

    def RenderJson(self, obj, debug):
        convertedObject = ConvertModelToDictionary(obj)
        if debug:
            returnJson = json.dumps(convertedObject, sort_keys=True, indent=4, separators=(',', ': '))
        else:
            returnJson = json.dumps(convertedObject)
        self.response.write(returnJson)

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

    def CallAPIMethod(self, methodCollection, methodName, params, callingCharacter):
        returnObject = {}
        if methodName.lower() in methodCollection.keys():
            method = methodCollection[methodName.lower()]
            args, varargs, keywords, defaults = inspect.getargspec(method)
            if len(args) == 0 or (len(args) == 1 and (args[0] == 'cls' or args[0] == 'self')):
                returnObject = methodCollection[methodName.lower()]()
            else:
                try:
                    parsedQuery = {}
                    for key, value in params.items():
                        if key.replace('[]', '') in parsedQuery:
                            if not hasattr(parsedQuery[key.replace('[]', '')], '__iter__'):
                                parsedQuery[key.replace('[]', '')] = [parsedQuery[key.replace('[]', '')]]
                            parsedQuery[key.replace('[]', '')].append(value)
                        else:
                            parsedQuery[key.replace('[]', '')] = value
                    parameters = []
                    for argName in args:
                        if argName == 'cls' or argName == 'self':
                            continue
                        if argName == "callingCharacter":
                            parameters.append(callingCharacter)
                            continue
                        try:
                            parameters.append(parsedQuery[argName])
                        except:
                            parameters.append(None)
                    returnObject = methodCollection[methodName.lower()](*parameters)
                except:
                    returnObject = {}
        return returnObject

    def GetAPICall(self, paramMethods, apiMethods):
        if not users.get_current_user():
            callingCharacter = Character.GetDefault()
        else:
            callingCharacter = Character.GetCharacterByID(users.get_current_user().user_id())
        apiPath = [value for value in self.request.path.split('/') if not value == ""]
        debug = False
        subApiPaths = {}
        if len(apiPath) > 2:
            #do stuff for the sub paths to build the appropriate query
            subApiPaths = apiPath[2:]
            if 'debug' in subApiPaths:
                debug = True
                subApiPaths.remove('debug')

        params = self.request.params
        kvp = params.items()
        returnRecord = {}
        if len(subApiPaths) == 0:
            for key, value in kvp:
                if key.lower() in paramMethods.keys():
                    returnRecord = paramMethods[key](value)
                    if not returnRecord:
                        returnRecord = {}
                    break
        else:
            for api in subApiPaths:
                returnRecord = self.CallAPIMethod(apiMethods, api, params, callingCharacter)
                if not returnRecord == {}:
                    break

        #do normal Stuff
        self.RenderJson(returnRecord, debug)
        return

    def SetAPICall(self, apiMethods):
        try:
            callingCharacter = Character.GetCharacterByID(users.get_current_user().user_id())
        except:
            self.RenderJson(GetAPIError(APIErrorTypes.DENIED, {"message": "Cannot Call any SetAPI while not logged in"}), True)
            return
        apiPath = [value for value in self.request.path.split('/') if not value == ""]
        debug = False
        subApiPaths = {}
        if len(apiPath) > 2:
            #do stuff for the sub paths to build the appropriate query
            subApiPaths = apiPath[2:]
            if 'debug' in subApiPaths:
                debug = True
                subApiPaths.remove('debug')

        params = self.request.params
        returnObj = {}
        if len(subApiPaths) == 0:
            error = {"error": "cannot call SetCourse without subAPIs",
                     "subAPIs": [key for key in apiMethods]
                     }
            self.RenderJson(error, True)
            return
        else:
            for api in subApiPaths:
                returnObj = self.CallAPIMethod(apiMethods, api, params, callingCharacter)
                if not returnObj == {}:
                    break

        #do normal Stuff
        self.RenderJson(returnObj, debug)
        return

    #API methods
    #(Must Start with "API"
    #access query parameters from self.request.GET, self.request.POST, or self.request.params)

    def GetLogInOutURLAPI(self):
        params = self.request.params
        if 'url' in params:
            url = params['url']
        else:
            url = self.request.uri
        returnObj = {"text": "", 'url': ''}
        if users.GetCurrentUser():
            returnObj['url'] = self.LogOutAPI(url)
            returnObj['text'] = "Logout"
            returnObj['loggedIn'] = True
            returnObj['studentEmail'] = users.GetCurrentUser().email()
        else:
            returnObj['url'] = self.LogInAPI(url)
            returnObj['text'] = "Login"
            returnObj['loggedIn'] = False
            returnObj['studentEmail'] = "Student"

        self.RenderJson(returnObj, False)

    def LogOutAPI(self, baseUrl):
        if not users.GetCurrentUser():
            return
        url = users.create_logout_url(baseUrl)
        return url

    def LogInAPI(self, baseUrl):
        if users.GetCurrentUser():
            return
        url = users.create_login_url(baseUrl)
        return url

    def GetCharacterAPI(self):
        self.GetAPICall(GetCharacterParamMethods, GetCharacterAPIMethods)

    def SetCharacterAPI(self):
        self.SetAPICall(SetCharacterAPIMethods)

    def GetCourseAPI(self):
        self.GetAPICall(GetCourseParamMethods, GetCourseAPIMethods)

    def SetCourseAPI(self):
        self.SetAPICall(SetCourseAPIMethods)

    def GetProjectAPI(self):
        self.GetAPICall(GetProjectParamMethods, GetProjectAPIMethods)

    def SetProjectAPI(self):
        self.SetAPICall(SetProjectAPIMethods)

    def GetIconAPI(self):
        self.GetAPICall(GetIconParamMethods, GetIconAPIMethods)

    def SetIconAPI(self):
        self.SetAPICall(SetIconAPIMethods)

    def GetCharacterProjectAPI(self):
        self.GetAPICall(GetCharacterProjectParamMethods, GetCharacterProjectAPIMethods)

    def SetCharacterProjectAPI(self):
        self.SetAPICall(SetCharacterProjectAPIMethods)

    def GetLevelGradeChartAPI(self):
        self.GetAPICall(GetGradeChartParamMethods, GetGradeChartAPIMethods)

    def SetLevelGradeChartAPI(self):
        self.SetAPICall(SetGradeChartAPIMethods)

    def GetCharacterGradeAPI(self):
        self.GetAPICall(GetCharacterGradeParamMethods, GetCharacterGradeAPIMethods)

    def SetCharacterGradeAPI(self):
        self.SetAPICall(SetCharacterGradeAPIMethods)

    def UpdateAllAPI(self):
        try:
            callingCharacter = Character.GetCharacterByID(users.get_current_user().user_id())
        except:
            self.RenderJson(GetAPIError(APIErrorTypes.DENIED, {"message": "Cannot Call any Update while not logged in"}), True)
            return
        if callingCharacter.isAdmin:
            LevelGradeChart.UpdateAllRecords()
            Course.UpdateAllRecords()
            Project.UpdateAllRecords(callingCharacter)
            Character.UpdateAllRecords()
            CharacterGrade.UpdateAllRecords()
            Icon.UpdateAllRecords()
            CharacterProject.UpdateAllRecords()
