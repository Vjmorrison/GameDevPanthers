__author__ = 'vjmor_000'

import types
import math
import datetime
import time
from google.appengine.api import users

from google.appengine.ext import ndb


class BaseModel(ndb.Model):
    @classmethod
    def Get(cls, modelKey):
        try:
            if isinstance(modelKey, ndb.Key):
                entity = modelKey.get()
            elif isinstance(modelKey, basestring):
                entity = ndb.Key(urlsafe=modelKey).get()
            else:
                entity = cls.get_by_id(int(modelKey))
            if entity and isinstance(entity, cls):
                setattr(entity, "urlsafe", GetUrlSafeKey(entity))
            return entity
        except:
            return None


def UpdateRecord(record, updatedArgs, callingCharacter, validUserKey):
    alreadyAdded = []
    for arg in updatedArgs:
        name, value = SplitNameValue(arg)
        if callingCharacter.isAdmin or (validUserKey is not None and len(validUserKey) > 0 and GetKey(callingCharacter) == ndb.Key(urlsafe=validUserKey)):
            if hasattr(record, name):
                originalValue = getattr(record, name, value)
                try:
                    if hasattr(originalValue, '__iter__'):
                        if name in alreadyAdded:
                            newValue = []
                            for origValue in originalValue:
                                newValue.append(origValue)
                            newValue.append(value)
                            setattr(record, name, newValue)
                        else:
                            setattr(record, name, [value])
                            alreadyAdded.append(name)
                    elif name.lower().startswith('is'):
                        if value is None or value.lower() == 'false' or len(value) <= 0:
                            setattr(record, name, False)
                        else:
                            setattr(record, name, True)
                    elif originalValue is None:
                        setattr(record, name, value)
                    else:
                        setattr(record, name, type(originalValue)(value))
                except:
                    try:
                        if len(value) > 0:
                            key = ndb.Key(urlsafe=value)
                            originalValue = getattr(record, name, value)
                            if hasattr(originalValue, '__iter__'):
                                if name in alreadyAdded:
                                    newValue = []
                                    for origValue in originalValue:
                                        newValue.append(origValue)
                                    newValue.append(key)
                                    setattr(record, name, newValue)
                                else:
                                    alreadyAdded.append(name)
                                    setattr(record, name, [key])
                            else:
                                setattr(record, name, key)
                    except:
                        continue
        else:
            return None
    return record


def SplitNameValue(arg):
    try:
        name, value = arg.split(':')
    except:
        splits = arg.split(':')
        name = splits[0]
        value = ":".join(splits[1:])

    return name, value


def ConvertModelToDictionary(obj):
    if isinstance(obj, users.User):
        return obj.email()

    if isinstance(obj, ndb.Model):
        convertedObject = obj.to_dict()
        if hasattr(obj, 'urlsafe'):
            convertedObject['urlsafe'] = obj.urlsafe
    elif isinstance(obj, ndb.Key):
        convertedObject = obj.urlsafe()
    elif isinstance(obj, datetime.datetime):
        convertedObject = time.mktime(obj.timetuple())
    else:
        convertedObject = obj

    if hasattr(convertedObject, '__iter__'):
        if hasattr(convertedObject, 'keys'):
            for key in convertedObject.keys():
                convertedObject[key] = ConvertModelToDictionary(convertedObject[key])
        else:
            for index in range(0, len(convertedObject)):
                convertedObject[index] = ConvertModelToDictionary(convertedObject[index])

    return convertedObject


class APIErrorTypes:
    EXISTS = 'ALREADY EXISTS'
    NOTEXIST = 'DOES NOT EXIST'
    DENIED = 'PERMISSION DENIED'
    UNKNOWN = 'UNKNOWN'

APIErrorData = {'ALREADY EXISTS': {'message': "Object Already Exists"},
                'DOES NOT EXIST': {'message': "Object Does Not Exist"},
                'PERMISSION DENIED': {'message': "Permission Was denied"},
                'UNKNOWN': {'message': "An Unknown Error has occurred"}}


def GetAPIError(errorType, data):
    errorDict = {}
    if errorType in APIErrorData:
        errorDict["error"] = {"type": errorType, "message": APIErrorData[errorType]['message']}
        errorDict["data"] = data
        return errorDict
    else:
        errorDict["error"] = {"type": errorType, "message": APIErrorData["UNKNOWN"]['message']}
        errorDict["data"] = data
        return errorDict


def ForceObjectToList(Object):
    if Object:
            if not isinstance(Object, types.ListType):
                Object = [Object]
    else:
        Object = []

    return Object


def GetAllRecords(classDef):
    if hasattr(classDef, "query"):
        allRecords = classDef.query().fetch()
        if allRecords is None:
            return allRecords
        if not isinstance(allRecords, types.ListType):
            allRecords = [allRecords]
        for record in allRecords:
            setattr(record, 'urlsafe', GetUrlSafeKey(record))
        return allRecords


def GetKey(modelObject):
    if isinstance(modelObject, ndb.Model):
        return modelObject.key


def GetUrlSafeKey(modelObject):
    if isinstance(modelObject, ndb.Model):
        return modelObject.key.urlsafe()


def GetDefaultInstance(classDef):
    try:
        return classDef()
    except:
        return {}


#'''-----------------------------------------------ICON--------------------------------------'''
class Icon(BaseModel):
    IconData = ndb.BlobProperty(indexed=False)
    Deleted = ndb.BooleanProperty(indexed=True)

    @classmethod
    def GetDefault(cls):
        return GetDefaultInstance(cls)

    @classmethod
    def GetAllIcons(cls):
        return GetAllRecords(cls)

    @classmethod
    def UpdateAllRecords(cls):
        allRecords = Icon.query()
        for icon in allRecords:
            icon.put()

    @classmethod
    def AddIcon(cls, callingCharacter, iconData):
        if callingCharacter.isAdmin:
            newIcon = Icon()
            newIcon.IconData = iconData
            newIcon.put()
            return newIcon
        return

    @classmethod
    def UpdateIcon(cls, callingCharacter, iconID, updatedArgs):
        icon = cls.Get(iconID)
        if not icon:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted IconID": iconID, "Calling CharacterID": callingCharacter.userID})
        if not hasattr(updatedArgs, '__iter__'):
            updatedArgs = [updatedArgs]
        if UpdateRecord(icon, updatedArgs, callingCharacter, None):
            icon.put()
        return icon

    @classmethod
    def Delete(cls, callingCharacter, iconID):
        if callingCharacter.isAdmin:
            icon = cls.Get(iconID)
            if icon:
                icon.key.delete()
            else:
                return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted userID": iconID})
        else:
            return GetAPIError(APIErrorTypes.DENIED, {"Targeted recordID": iconID, "Calling CharacterID": callingCharacter.userID})

GetIconParamMethods = {
    'id': Icon.Get
}

GetIconAPIMethods = {
    'all': Icon.GetAllIcons,
    'default': Icon.GetDefault
}

SetIconAPIMethods = {
    'update': Icon.UpdateIcon,
    'new': Icon.AddIcon,
    'delete': Icon.Delete
}


#'''-----------------------------------------------CHARACTER--------------------------------------'''
class Character(BaseModel):
    username = ndb.StringProperty()
    fullName = ndb.StringProperty()
    avatar = ndb.StringProperty(indexed=False)
    user = ndb.UserProperty()
    userID = ndb.StringProperty()
    isAdmin = ndb.BooleanProperty()
    isUnderReview = ndb.BooleanProperty()

    NonAdminProperties = ['username', 'fullName', 'currentProjectKey', 'avatar']

    levelIcons = ['http://i.imgur.com/hUMMKMg.gif', 'http://i.imgur.com/hUMMKMg.gif',
                  'http://i.imgur.com/ymBFo1w.gif',
                  'http://i.imgur.com/2pYN6xR.gif',
                  'http://i.imgur.com/lFzmAH2.gif',
                  'http://i.imgur.com/M8PvDZT.gif',
                  'http://i.imgur.com/YUVmV3x.gif',
                  'http://i.imgur.com/uGd0W1Q.gif',
                  'http://i.imgur.com/sdpyIK7.gif',
                  'http://i.imgur.com/ZdA5r4g.gif',
                  'http://i.imgur.com/r1wuscm.gif']

    CharacterErrorTypes = {'ALREADY EXISTS': {'message': "Character Already Exists"},
                           'DOES NOT EXIST': {'message': "Character Does Not Exist"},
                           'PERMISSION DENIED': {'message': "Permission Was denied"},
                           'UNKNOWN': {'message': "An Unknown Error has occured"}}

    @classmethod
    def GetDefault(cls):
        return GetDefaultInstance(cls)

    @classmethod
    def GetCharacterByUser(cls, pUser):
        qry = Character.query(Character.userID == pUser.user_id())
        character = qry.get()
        if character:
            setattr(character, 'urlsafe', GetUrlSafeKey(character))
            return character
        return

    @classmethod
    def GetCurrentCharacter(cls):
        user = users.GetCurrentUser()
        if user:
            char = cls.GetCharacterByUser(user)
            if char:
                CharacterGrade.RecalculateCharacterXP(char.key.urlsafe())
                return char
            else:
                return cls.PutNewCharacter(user, user.email(), user.email(), None)
        return cls.GetGuestCharacter()

    @classmethod
    def GetWaitingCharacters(cls):
        qry = cls.query(Character.isUnderReview == True)
        allRecords = qry.fetch()
        if allRecords is None:
            return None
        if not isinstance(allRecords, types.ListType):
            allRecords = [allRecords]
        return allRecords

    @classmethod
    def GetAllCharacters(cls):
        return GetAllRecords(cls)

    @classmethod
    def PutNewCharacter(cls, pUser, pFullName, pUsername, avatarURL):
        if pUser and cls.GetCharacterByID(pUser.user_id()):
            return GetAPIError(APIErrorTypes.EXISTS, {"UserID": pUser.user_id()})

        character = cls()
        character.username = pUsername
        character.fullName = pFullName
        character.user = pUser
        if pUser:
            character.userID = pUser.user_id()
        character.level = 1
        if avatarURL is None:
            avatarURL = "/images/missing.png"
        character.avatar = avatarURL
        character.isAdmin = False
        character.isUnderReview = True
        character.put()
        return character

    @classmethod
    def GetCharacterByID(cls, pUserID):
        qry = cls.query(Character.userID == str(pUserID))
        character = qry.get()
        if character:
            return character
        return 0

    @classmethod
    def GetCharacterByUrlSafe(cls, callingCharacter, characterID):
        if callingCharacter.isAdmin:
            return ndb.Key(urlsafe=characterID).get()
        return None

    @classmethod
    def GetCharacterByName(cls, charName):
        char = cls.query(Character.username == str(charName)).fetch(1)
        if isinstance(char, types.ListType) and len(char) > 0:
            char = char[0]
        return char

    @classmethod
    def GetGuestCharacter(cls):
        guestCourse = Course.GetCourseByNumber("GUEST")
        if not guestCourse:

            guestCourse = Course.AddNewCourse("GUEST", "GUEST", "A temp course for users to sample the website", "http://gamedevpanthers.appspot.com/", None, GetKey(LevelGradeChart.GetDefaultChart()))

        guestChar = Character.GetCharacterByName("GUEST")
        if not guestChar:
            guestChar = Character.PutNewCharacter(None, "GUEST", "GUEST", "/images/missing.png")
            guestChar.isUnderReview = False
            guestChar.put()
            guestGrade = CharacterGrade()
            guestGrade.characterKey = guestChar.key
            guestGrade.courseKey = guestCourse.key
            guestGrade.xp = 75000
            guestGrade.UpdateLevelForXP()
            guestGrade.put()
        setattr(guestChar, 'urlsafe', GetUrlSafeKey(guestChar))
        return guestChar

    @classmethod
    def UpdateAllRecords(cls):
        allRecords = Character.query()
        for character in allRecords:
            if "courseID" in character._properties:
                del character._properties['courseID']
                del character._values['courseID']
            if "currentProjectKey" in character._properties:
                del character._properties['currentProjectKey']
                del character._values['currentProjectKey']
            if "level" in character._properties:
                del character._properties['level']
                del character._values['level']
            if "numProjects" in character._properties:
                del character._properties['numProjects']
                del character._values['numProjects']
            if "xp" in character._properties:
                del character._properties['xp']
                del character._values['xp']
            character.put()

    @classmethod
    def UpdateCharacter(cls, callingCharacter, userID, updatedArgs):
        char = cls.GetCharacterByID(userID)
        if not char:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted CharacterID": userID, "Calling CharacterID": callingCharacter.userID})
        if not hasattr(updatedArgs, '__iter__'):
            updatedArgs = [updatedArgs]

        if UpdateRecord(char, updatedArgs, callingCharacter, char.key.urlsafe()):
            char.put()
        return char

    @classmethod
    def AcceptCharacter(cls, userID):
        char = cls.GetCharacterByID(userID)
        if char and isinstance(char, Character):
            char.isUnderReview = False
            char.put()
            return char
        else:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted userID": userID})

    @classmethod
    def AcceptCharacter(cls, userID):
        char = cls.GetCharacterByID(userID)
        if char:
            char.isUnderReview = False
        else:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted userID": userID})

    @classmethod
    def RejectCharacter(cls, userID):
        cls.Delete(userID)

    @classmethod
    def Delete(cls, userID):
        char = cls.GetCharacterByID(userID)
        if char and isinstance(char, Character):
            char.key.delete()
        else:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted userID": userID})

    @classmethod
    def DeleteByID(cls, characterID):
        char = cls.Get(characterID)
        if char:
            char.key.delete()
            return "character Deleted"
        else:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted userID": characterID})


GetCharacterParamMethods = {
    'name': Character.GetCharacterByName,
    'userID': Character.GetCharacterByID
}

GetCharacterAPIMethods = {
    'all': Character.GetAllCharacters,
    'waiting': Character.GetWaitingCharacters,
    'guest': Character.GetGuestCharacter,
    'default': Character.GetDefault,
    'current': Character.GetCurrentCharacter,
    'bykey': Character.GetCharacterByUrlSafe
}

SetCharacterAPIMethods = {
    'update': Character.UpdateCharacter,
    'new': Character.PutNewCharacter,
    'delete': Character.Delete,
    'deletebyid': Character.DeleteByID,
    'accept': Character.AcceptCharacter,
    'reject': Character.RejectCharacter
}


#'''-----------------------------------------------LEVEL GRADE CHART--------------------------------------'''
class LevelGradeChart(BaseModel):
    Description = ndb.StringProperty(default="New Level Chart")
    MaxLevel = ndb.IntegerProperty(indexed=False, default=21)
    MinLevel_forA = ndb.IntegerProperty(indexed=False, default=20)
    MinLevel_forB = ndb.IntegerProperty(indexed=False, default=17)
    MinLevel_forC = ndb.IntegerProperty(indexed=False, default=15)
    MinLevel_forD = ndb.IntegerProperty(indexed=False, default=13)
    BaseLevelIncrement = ndb.IntegerProperty(indexed=False, default=1000)

    ChallengeLevel = {"TRIVIAL": -5,
                      "EASY": -2,
                      "NORMAL": 0,
                      "CHALLENGING": 2,
                      "HARD": 5,
                      "INSANE": 10}

    @classmethod
    def GetAllRecords(cls):
        return GetAllRecords(cls)

    @classmethod
    def UpdateAllRecords(cls):
        allRecords = LevelGradeChart.query()
        for chart in allRecords:
            chart.put()

    @classmethod
    def Delete(cls, callingCharacter, characterProjectID):
        if callingCharacter.isAdmin:
            proj = cls.Get(characterProjectID)
            if proj:
                proj.key.delete()
        else:
            return

    @classmethod
    def GetDefaultChart(cls):
        allRecords = GetAllRecords(cls)
        guestChartList = [chart for chart in allRecords if chart.Description == "DEFAULT"]
        if len(guestChartList) > 0:
            return guestChartList[0]
        guestChart = LevelGradeChart()
        guestChart.Description = "DEFAULT"
        guestChart.put()
        return guestChart

    @classmethod
    def AddLevelChart(cls, callingCharacter, s_description, i_maxLevel, i_minLevelForA, i_minLevelForB, i_minLevelForC, i_minLevelForD, i_baseLevelIncrement):
        if callingCharacter.isAdmin:
            newChart = LevelGradeChart()
            newChart.Description = s_description
            newChart.MaxLevel = i_maxLevel
            newChart.MinLevel_forA = i_minLevelForA
            newChart.MinLevel_forB = i_minLevelForB
            newChart.MinLevel_forC = i_minLevelForC
            newChart.MinLevel_forD = i_minLevelForD
            newChart.BaseLevelIncrement = i_baseLevelIncrement
            newChart.put()
            return newChart

    @classmethod
    def UpdateLevelChart(cls, callingCharacter, chartID, updatedArgs):
        chart = cls.Get(chartID)
        if not chart:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"ID": chartID, "Calling CharacterID": callingCharacter.userID})
        updatedArgs = ForceObjectToList(updatedArgs)
        if UpdateRecord(chart, updatedArgs, callingCharacter, None):
            chart.put()
        return chart

    @classmethod
    def GetMinXpForLevel(cls, chartID, levelNum):
        chart = cls.Get(chartID)
        if chart and isinstance(chart, LevelGradeChart):
            return chart.MinXpForLevel(levelNum)
        return

    @classmethod
    def GetGradeFromXP(cls, chartID, xpAmount):
        chart = cls.Get(chartID)
        if chart and isinstance(chart, LevelGradeChart):
            return chart.GradeLetterFromXP(xpAmount)
        return

    def MinXpForLevel(self, levelNum):
        levelNum = int(levelNum)
        return (math.pow(levelNum, 2) - levelNum) * 0.5 * int(self.BaseLevelIncrement)

    def GetProjectXP(self, projectLevel, challengeRating):
        if challengeRating.upper() in self.ChallengeLevel:
            projectLevel += self.ChallengeLevel[challengeRating.upper()]
        return (self.MinXpForLevel(projectLevel + 1) - self.MinXpForLevel(projectLevel)) / 2

    def GradeLetterFromXP(self, xpAmount):
        xpAmount = int(xpAmount)
        xpForD = self.MinXpForLevel(self.MinLevel_forD)
        if xpAmount < xpForD:
            return self.GetPlusMinusChar(xpAmount, 0, xpForD) + 'F'

        xpForC = self.MinXpForLevel(self.MinLevel_forC)
        if xpAmount < xpForC:
            return self.GetPlusMinusChar(xpAmount, xpForD, xpForC) + 'D'

        xpForB = self.MinXpForLevel(self.MinLevel_forB)
        if xpAmount < xpForB:
            return self.GetPlusMinusChar(xpAmount, xpForC, xpForB) + 'C'

        xpForA = self.MinXpForLevel(self.MinLevel_forA)
        if xpAmount < xpForA:
            return self.GetPlusMinusChar(xpAmount, xpForB, xpForA) + 'B'

        xpForMAX = self.MinXpForLevel(self.MaxLevel)
        return self.GetPlusMinusChar(xpAmount, xpForA, xpForMAX) + 'A'

    def GetPlusMinusChar(self, value, levelMin, levelMax):
        if value < levelMin or value > levelMax:
            return ""

        OneThirdOfLevelXP = (levelMax - levelMin) / 3
        if value < levelMin + OneThirdOfLevelXP:
            return '-'

        if value > levelMax - OneThirdOfLevelXP:
            return '+'

        return ""

GetGradeChartParamMethods = {
    'id': LevelGradeChart.Get
}

GetGradeChartAPIMethods = {
    'all': LevelGradeChart.GetAllRecords,
    'default': LevelGradeChart.GetDefaultChart,
    'minxp': LevelGradeChart.GetMinXpForLevel,
    'grade': LevelGradeChart.GetGradeFromXP
}

SetGradeChartAPIMethods = {
    'update': LevelGradeChart.UpdateLevelChart,
    'new': LevelGradeChart.AddLevelChart,
    'delete': LevelGradeChart.Delete,
}


#'''-----------------------------------------------COURSE--------------------------------------'''
class Course(BaseModel):
    Name = ndb.StringProperty()
    courseNumber = ndb.StringProperty()
    Description = ndb.TextProperty()
    syllabusLink = ndb.StringProperty()
    chartID = ndb.KeyProperty(indexed=True, kind=LevelGradeChart)
    IconID = ndb.KeyProperty(kind=Icon)

    @classmethod
    def GetDefault(cls):
        return GetDefaultInstance(cls)

    @classmethod
    def Delete(cls, callingCharacter, courseID):
        if callingCharacter.isAdmin:
            course = cls.Get(courseID)
            if course:
                course.key.delete()
                return True

    @classmethod
    def UpdateAllRecords(cls):
        allRecords = Course.query()
        for course in allRecords:
            if hasattr(course, '_properties'):
                if "courseDescription" in course._properties and course.Description is None:
                    course.Description = course._values['courseDescription']
                    del course._properties['courseDescription']
                    del course._values['courseDescription']
                if "courseName" in course._properties and course.Name is None:
                    course.Name = course._values['courseName']
                    del course._properties['courseName']
                    del course._values['courseName']
                if "iconURL" in course._properties:
                    del course._properties['iconURL']
                if "levelReqForA" in course._properties:
                    del course._properties['levelReqForA']
                if "maxProjectLevel" in course._properties:
                    del course._properties['maxProjectLevel']
                if hasattr(course, "chartID") and course.chartID is None:
                    course.chartID = LevelGradeChart.GetDefaultChart().key
                course.put()

    @classmethod
    def GetCourses(cls):
        allRecords = Course.query(Course.courseNumber < "GUEST" or Course.courseNumber > "GUEST").order(cls.courseNumber).fetch()
        if allRecords is None:
            return 0
        if not isinstance(allRecords, types.ListType):
            allRecords = [allRecords]
        for record in allRecords:
            setattr(record, 'urlsafe', GetUrlSafeKey(record))
        return allRecords

    @classmethod
    def GetAllCourses(cls):
        return GetAllRecords(cls)

    @classmethod
    def GetCourseByNumber(cls, courseNum):
        course = Course.query(Course.courseNumber == courseNum).fetch(1)
        if course is None or len(course) == 0:
            return 0
        if isinstance(course, types.ListType):
            course = course[0]
        return course

    @classmethod
    def AddNewCourse(cls, name, number, description, syllabusLink, k_IconID, k_chartID):
        course = cls.GetCourseByNumber(number)
        if not course:
            course = Course()
        else:
            return GetAPIError(APIErrorTypes.EXISTS, course.to_dict())

        course.Name = name
        course.courseNumber = number
        course.Description = description
        course.syllabusLink = syllabusLink
        try:
            course.IconID = GetKey(Icon.Get(k_IconID))
        except:
            course.IconID = None
        try:
            course.chartID = LevelGradeChart.Get(k_chartID).key
        except:
            course.chartID = LevelGradeChart.GetDefaultChart().key

        course.put()
        return course

    @classmethod
    def UpdateCourse(cls, callingCharacter, courseID, updatedArgs):
        course = cls.Get(courseID)
        if not course:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"courseID": courseID, "Calling CharacterID": callingCharacter.userID})
        if not hasattr(updatedArgs, '__iter__'):
            updatedArgs = [updatedArgs]

        if UpdateRecord(course, updatedArgs, callingCharacter, None):
            course.put()
        return course


GetCourseParamMethods = {
    'number': Course.GetCourseByNumber,
    'id': Course.Get
}

GetCourseAPIMethods = {
    'all': Course.GetAllCourses,
    'default': Course.GetDefault
}

SetCourseAPIMethods = {
    'update': Course.UpdateCourse,
    'new': Course.AddNewCourse,
    'delete': Course.Delete
}


#'''----------------------CHARACTER GRADE----------------------------'''
class CharacterGrade(BaseModel):
    characterKey = ndb.KeyProperty(indexed=True, kind=Character)
    courseKey = ndb.KeyProperty(indexed=True, kind=Course)
    xp = ndb.IntegerProperty(default=0)
    level = ndb.IntegerProperty(default=1)
    enrolledDate = ndb.DateTimeProperty(indexed=True, auto_now_add=True)
    approved = ndb.BooleanProperty(indexed=True, default=False)

    def UpdateLevelForXP(self):
        self.level = int(math.floor((1 + math.sqrt(int(self.xp) / 125 + 1)) / 2))

    @classmethod
    def GetDefault(cls):
        return GetDefaultInstance(cls)

    @classmethod
    def GetAllRecords(cls):
        return GetAllRecords(cls)

    @classmethod
    def UpdateAllRecords(cls):
        allRecords = cls.query()
        for charGrade in allRecords:
            if isinstance(charGrade, CharacterGrade):
                charGrade.put()

    @classmethod
    def GetGradesForCharacter(cls, characterKey):
        char = Character.Get(characterKey)
        if char:
            allRecords = CharacterGrade.query(CharacterGrade.characterKey == char.key).fetch()
            allRecords = ForceObjectToList(allRecords)
            for grade in allRecords:
                setattr(grade, "urlsafe", GetUrlSafeKey(grade))
            return allRecords

    @classmethod
    def RecalculateCharacterXP(cls, characterID):
        try:
            char = Character.Get(characterID)
            if char:
                allCompleted = CharacterProject.GetCompletedCharacterProjects(characterID)
                allGrades = cls.GetGradesForCharacter(characterID)
                gradeLookupByCourse = {}
                for grade in allGrades:
                    grade.xp = 0
                    gradeLookupByCourse[grade.courseKey] = grade
                for project in allCompleted:
                    course = Course.Get(project.CourseID)
                    if course and isinstance(course, Course):
                        chart = LevelGradeChart.Get(course.chartID)
                        if chart and isinstance(chart, LevelGradeChart):
                            projectInfo = project.ProjectID.get()
                            projectXP = chart.GetProjectXP(projectInfo.level, projectInfo.ChallengeLevel)
                            grade = gradeLookupByCourse[course.key]
                            if grade and isinstance(grade, CharacterGrade):
                                grade.xp += int(projectXP)
                for grade in allGrades:
                    grade.UpdateLevelForXP()
                    grade.put()

        except:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"characterKey": characterID})

    @classmethod
    def Delete(cls, callingCharacter, gradeID):
        if callingCharacter.isAdmin:
            obj = cls.Get(gradeID)
            if obj:
                obj.key.delete()
        else:
            return

    @classmethod
    def AddCharacterGrade(cls, callingCharacter, k_courseID, k_characterID):
        grade = CharacterGrade()
        grade.characterKey = GetKey(Character.Get(k_characterID))
        grade.courseKey = GetKey(Course.Get(k_courseID))
        grade.put()
        return grade

    @classmethod
    def UpdateLevel(cls, gradeID):
        grade = cls.Get(gradeID)
        if not grade:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"Targeted gradeID": gradeID})
        grade.UpdateLevelForXP()
        grade.put()
        return grade

    @classmethod
    def UpdateCharacterGrade(cls, callingCharacter, characterGradeID, updatedArgs):
        grade = cls.Get(characterGradeID)
        if not grade:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"ID": characterGradeID, "Calling CharacterID": callingCharacter.userID})
        updatedArgs = ForceObjectToList(updatedArgs)

        if UpdateRecord(grade, updatedArgs, callingCharacter, None):
            grade.UpdateLevelForXP()
            grade.put()
        return grade

    @classmethod
    def AddXP(cls, gradeID, xpToAdd):
        grade = cls.Get(gradeID)
        if grade and isinstance(grade, CharacterGrade):
            grade.xp += int(xpToAdd)
            grade.UpdateLevelForXP()
            grade.put()
            return grade

GetCharacterGradeParamMethods = {
    'id': CharacterGrade.Get
}

GetCharacterGradeAPIMethods = {
    'all': CharacterGrade.GetAllRecords,
    'default': CharacterGrade.GetDefault,
    'enrolled': CharacterGrade.GetGradesForCharacter
}

SetCharacterGradeAPIMethods = {
    'update': CharacterGrade.UpdateCharacterGrade,
    'new': CharacterGrade.AddCharacterGrade,
    'delete': CharacterGrade.Delete,
    'addxp': CharacterGrade.AddXP

}


#'''-------------------PROJECT---------------------------------------'''
class Project(BaseModel):
    projectName = ndb.StringProperty()
    level = ndb.IntegerProperty()
    ChallengeLevel = ndb.StringProperty()
    description = ndb.StringProperty(indexed=False)
    requirements = ndb.StringProperty(repeated=True, indexed=False)
    videoURL = ndb.StringProperty(indexed=False)
    attachments = ndb.StringProperty(repeated=True, indexed=False)
    prerequisiteProjectIDs = ndb.KeyProperty(repeated=True, indexed=True)
    owningCharacter = ndb.KeyProperty(indexed=True, kind=Character)
    courseKey = ndb.KeyProperty(indexed=True, kind=Course)

    @classmethod
    def GetDefault(cls):
        return GetDefaultInstance(cls)

    @classmethod
    def Delete(cls, projectID):
        project = cls.Get(projectID)
        if project:
            project.key.delete()

    @classmethod
    def GetProjects(cls):
        allProjects = Project.query().order(cls.level, cls.projectName).fetch()
        allProjects = ForceObjectToList(allProjects)
        for proj in allProjects:
            setattr(proj, 'urlsafe', GetUrlSafeKey(proj))
        return allProjects

    @classmethod
    def GetProjectsByCourse(cls, courseKey):
        courseKey = ndb.Key(urlsafe=courseKey)
        projects = cls.query(Project.courseKey == courseKey).fetch()
        projects = ForceObjectToList(projects)
        for proj in projects:
            setattr(proj, 'urlsafe', GetUrlSafeKey(proj))
        return projects

    @classmethod
    def GetProjectsByCharacter(cls, characterUrlSafe):
        characterKey = ndb.Key(urlsafe=characterUrlSafe)
        projects = cls.query(cls.owningCharacter == characterKey).fetch()
        projects = ForceObjectToList(projects)
        for proj in projects:
            setattr(proj, 'urlsafe', GetUrlSafeKey(proj))
        return projects

    @classmethod
    def UpdateAllRecords(cls, callingCharacter):
        if callingCharacter.isAdmin:
            allProjects = Project.GetProjects()
            for project in allProjects:
                if "xp" in project._properties:
                    del project._properties['xp']
                    del project._values['xp']
                if "courseID" in project._properties:
                    del project._properties['courseID']
                    del project._values['courseID']
                if project.ChallengeLevel is None:
                    project.courseKey = Course.GetCourseByNumber('CPSC-244').key
                    project.ChallengeLevel = 'normal'
                    project.owningCharacter = callingCharacter.key
                project.put()

    @classmethod
    def AddPrerequisiteProject(cls, sourceProjectKey, prereqProjectKey):
        sourceProject = cls.Get(sourceProjectKey)
        if sourceProject and prereqProjectKey not in sourceProject.prerequisiteProjectIDs:
            sourceProject.prerequisiteProjectIDs.append(prereqProjectKey)

    @classmethod
    def AddProject(cls, k_characterID, s_name, i_level, s_challengeLevel, s_description, s_videoURL, s_attachmentList, s_requirementList, k_prereqList, k_courseID):
        s_attachmentList = ForceObjectToList(s_attachmentList)
        s_requirementList = ForceObjectToList(s_requirementList)
        k_prereqList = ForceObjectToList(k_prereqList)

        newProject = Project()
        newProject.owningCharacter = GetKey(Character.Get(k_characterID))
        newProject.projectName = s_name
        newProject.level = int(i_level)
        newProject.ChallengeLevel = s_challengeLevel
        newProject.description = s_description
        newProject.requirements = s_requirementList
        newProject.videoURL = s_videoURL
        newProject.attachments = s_attachmentList
        for prereq in k_prereqList:
            try:
                newProject.prerequisiteProjectIDs.append(ndb.Key(urlsafe=prereq))
            except:
                continue
        newProject.courseKey = GetKey(Course.Get(k_courseID))
        newProject.put()

        return newProject

    @classmethod
    def UpdateProject(cls, callingCharacter, projectID, updatedArgs):
        project = cls.Get(projectID)
        if not project:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"courseID": projectID, "Calling CharacterID": callingCharacter.userID})
        updatedArgs = ForceObjectToList(updatedArgs)

        if UpdateRecord(project, updatedArgs, callingCharacter, None):
            project.put()
        return project


GetProjectParamMethods = {
    'id': Project.Get
}

GetProjectAPIMethods = {
    'all': Project.GetProjects,
    'default': Project.GetDefault,
    'bycourse': Project.GetProjectsByCourse,
    'bycharacter': Project.GetProjectsByCharacter
}

SetProjectAPIMethods = {
    'update': Project.UpdateProject,
    'new': Project.AddProject,
    'delete': Project.Delete,
    'addprereq': Project.AddPrerequisiteProject,
    'updateall': Project.UpdateAllRecords
}


#'''---------------------------------------CHARACTER PROJECT----------------------------------------'''
class CharacterProject(BaseModel):
    CharacterID = ndb.KeyProperty(indexed=True, kind=Character)
    ProjectID = ndb.KeyProperty(indexed=True, kind=Project)
    CourseID = ndb.KeyProperty(indexed=True, kind=Course)
    Status = ndb.StringProperty(indexed=True, choices=['InProgress', 'Complete', 'UnderReview', 'Rejected'], default='InProgress')
    LastModifiedDate = ndb.DateTimeProperty(auto_now=True)
    SubmissionLinks = ndb.StringProperty(indexed=False, repeated=True)

    @classmethod
    def GetDefault(cls):
        return GetDefaultInstance(cls)

    @classmethod
    def GetAllRecords(cls):
        return GetAllRecords(cls)

    @classmethod
    def UpdateAllRecords(cls):
        allRecords = CharacterProject.query()
        for charProj in allRecords:
            charProj.put()

    @classmethod
    def GetCharacterProjectsByCharacter(cls, characterID):
        char = Character.Get(characterID)
        if char and isinstance(char, Character):
            allRecords = cls.query(cls.CharacterID == char.key).order(CharacterProject.LastModifiedDate).fetch()
            allRecords = ForceObjectToList(allRecords)
            for proj in allRecords:
                setattr(proj, 'urlsafe', GetUrlSafeKey(proj))
                try:
                    setattr(proj, 'courseKey', proj.ProjectID.urlsafe())
                except:
                    setattr(proj, 'courseKey', "")
            return allRecords


    @classmethod
    def GetCharacterProjectsByCourse(cls, callingCharacter, courseID):
        if not callingCharacter.isAdmin:
            return []
        courseKey = ndb.Key(urlsafe=courseID)
        if courseKey and isinstance(courseKey, ndb.Key):
            allRecords = cls.query(cls.CourseID == courseKey).fetch()
            allRecords = ForceObjectToList(allRecords)
            for proj in allRecords:
                setattr(proj, 'urlsafe', GetUrlSafeKey(proj))
                try:
                    setattr(proj, 'courseKey', proj.ProjectID.urlsafe())
                except:
                    setattr(proj, 'courseKey', "")
            return allRecords

    @classmethod
    def GetCompletedCharacterProjects(cls, characterID):
        char = Character.Get(characterID)
        if char and isinstance(char, Character):
            allRecords = cls.query(cls.CharacterID == char.key and cls.Status == "Complete").fetch()
            allRecords = ForceObjectToList(allRecords)
            for proj in allRecords:
                setattr(proj, 'urlsafe', GetUrlSafeKey(proj))
                try:
                    setattr(proj, 'courseKey', GetUrlSafeKey(proj.ProjectID.get()))
                except:
                    setattr(proj, 'courseKey', "")
            return allRecords

    @classmethod
    def Delete(cls, callingCharacter, characterProjectID):
        if callingCharacter.isAdmin:
            proj = cls.Get(characterProjectID)
            if proj:
                proj.key.delete()
        else:
            return

    @classmethod
    def AddCharacterProject(cls, callingCharacter, k_projectID, k_characterID, l_submissionLinks):
        if GetKey(callingCharacter) == GetKey(Character.Get(k_characterID)) or callingCharacter.isAdmin:
            newProject = CharacterProject()
            newProject.CharacterID = GetKey(Character.Get(k_characterID))
            newProject.ProjectID = GetKey(Project.Get(k_projectID))
            newProject.CourseID = Project.Get(k_projectID).courseKey
            if l_submissionLinks:
                newProject.SubmissionLinks = ForceObjectToList(l_submissionLinks)
                newProject.Status = 'UnderReview'
            newProject.put()
            return newProject

    @classmethod
    def UpdateCharacterProject(cls, callingCharacter, characterProjectID, updatedArgs):
        project = cls.Get(characterProjectID)
        if not project:
            return GetAPIError(APIErrorTypes.NOTEXIST, {"ID": characterProjectID, "Calling CharacterID": callingCharacter.userID})
        updatedArgs = ForceObjectToList(updatedArgs)
        if UpdateRecord(project, updatedArgs, callingCharacter, project.CharacterID):
            project.put()
        return project

    @classmethod
    def Approve(cls, callingCharacter, submittedProjectID):
        if callingCharacter.isAdmin:
            subProject = cls.Get(submittedProjectID)
            if subProject and isinstance(subProject, CharacterProject):
                subProject.Status = "Complete"
                subProject.put()
                CharacterGrade.RecalculateCharacterXP(subProject.CharacterID)
            return subProject

    @classmethod
    def Reject(cls, callingCharacter, submittedProjectID):
        if callingCharacter.isAdmin:
            subProject = cls.Get(submittedProjectID)
            if subProject:
                subProject.Status = "Rejected"
                subProject.put()
            return subProject

    @classmethod
    def Active(cls, callingCharacter, submittedProjectID):
        subProject = cls.Get(submittedProjectID)
        if subProject and isinstance(subProject, CharacterProject):
            if callingCharacter.isAdmin or subProject.CharacterID == GetKey(callingCharacter):
                subProject.Status = "InProgress"
                subProject.put()
        return subProject

    @classmethod
    def Submit(cls, callingCharacter, submittedProjectID, submissionLinks, k_projectID, k_characterID):
        subProject = cls.Get(submittedProjectID)
        if subProject and isinstance(subProject, CharacterProject):
            if callingCharacter.isAdmin or subProject.CharacterID == GetKey(callingCharacter):
                    if not submissionLinks:
                        submissionLinks = []
                    subProject.SubmissionLinks = submissionLinks
                    subProject.Status = "UnderReview"
                    subProject.put()
        else:
            projKey = ndb.Key(urlsafe=k_projectID)
            results = cls.GetCharacterProjectsByCharacter(k_characterID)
            if results:
                for subProj in results:
                    if subProj.ProjectID == projKey and subProj.Status == "InProgress":
                        if not submissionLinks:
                            submissionLinks = []
                        if not hasattr(submissionLinks, '__iter__'):
                            submissionLinks = [submissionLinks]
                        subProj.SubmissionLinks = submissionLinks
                        subProj.Status = "UnderReview"
                        subProj.put()
                        break
            else:
                return cls.AddCharacterProject(callingCharacter, k_projectID, k_characterID, submissionLinks)

        return subProject

GetCharacterProjectParamMethods = {
    'id': CharacterProject.Get
}

GetCharacterProjectAPIMethods = {
    'all': CharacterProject.GetAllRecords,
    'default': CharacterProject.GetDefault,
    'bycharacter': CharacterProject.GetCharacterProjectsByCharacter,
    'bycourse': CharacterProject.GetCharacterProjectsByCourse,
    'complete': CharacterProject.GetCompletedCharacterProjects
}

SetCharacterProjectAPIMethods = {
    'update': CharacterProject.UpdateCharacterProject,
    'new': CharacterProject.AddCharacterProject,
    'delete': CharacterProject.Delete,
    'approve': CharacterProject.Approve,
    'reject': CharacterProject.Reject,
    'active': CharacterProject.Active,
    'submit': CharacterProject.Submit
}