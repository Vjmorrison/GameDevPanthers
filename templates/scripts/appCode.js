/**
 * Created with PyCharm.
 * User: vjmor_000
 * Date: 8/31/14
 * Time: 5:00 PM
 * To change this template use File | Settings | File Templates.
 */

;(function($) {
    $.connect = function(elem1, elem2, options) {
        var defaults = {
            container: '#container',
            leftLabel: 'Left',
            rightLabel: 'Right'
        };
        var parent = this;
        this.elem1 = this.elem1 || $(elem1);
        this.elem2 = this.elem2 || $(elem2);
        if (elem1.length === 0 || elem2.length === 0) {
            throw 'Cannot get instance of Element 1 or Element 2';
        }
        var A = {};
        var B = {};
        var C = {};
        this.options = $.extend(defaults, options || {});
        var makeConnector = function(data) {
            var container = $(parent.options.container);
            var html = $('<div class="connector"><p class="left title"></p><p class="right title"></p></div>');
            if (typeof parent.Connector === 'undefined') {
                parent.Connector = html.appendTo(container);
                parent.Connector.css({
                    position: 'absolute',
                    width: '100px',
                    'border-bottom': '1px solid grey'
                });
                parent.Connector.find('p').css({
                    display: 'inline-block',
                    'margin-bottom': '-3px'
                });
                parent.Connector.find('.left').css({
                    float: 'left',
                    padding: '0 10px'
                });
                parent.Connector.find('.right').css({
                    float: 'right',
                    padding: '0 10px'
                });
                parent.setLabels(parent.options);
            }
            var topOffset = -20;
            if (A.coords.tc[0] > B.coords.tc[0]) {
                parent.Connector.find('.title').css({
                    '-webkit-transform': 'rotate(180deg)',
                    '-ms-transform': 'rotate(180deg)',
                    'transform': 'rotate(180deg)'
                });
            } else {
                parent.Connector.find('.title').css({
                    '-webkit-transform': 'rotate(0deg)',
                    '-ms-transform': 'rotate(0deg)',
                    'transform': 'rotate(0deg)'
                });
            }
            parent.Connector.css({
                top: C.sc[1] + topOffset + 'px',
                left: C.sc[0] + 'px',
                width: C.width + 'px',
                '-webkit-transform': 'rotate(' + C.angleA + 'deg)',
                '-webkit-transform-origin': '0% 100%',
                '-ms-transform': 'rotate(' + C.angleA + 'deg)',
                '-ms-transform-origin': '0% 100%',
                'transform': 'rotate(' + C.angleA + 'deg)',
                'transform-origin': '0% 100%'
            });
        };
        this.setLabels = function(values) {
            var defaults = {
                leftLabel: 'Left',
                rightLabel: 'Right'
            };
            var labels = $.extend(defaults, values);
            $(parent.Connector).find('.title').each(function(idx, elem) {
                var e = $(elem);
                if (e.hasClass('left')) {
                    e.html(labels.leftLabel);
                } else {
                    e.html(labels.rightLabel);
                }
            });
            return parent;
        };
        var getCoords = function(elem, width, height) {
            function pX(elem) {
                return elem.position().left;
            }
            function pY(elem) {
                return elem.position().top;
            }
            var px = pX(elem);
            var cen = px + (width / 2);
            var py = pY(elem);
            var mid = py + (height / 2);
            var ret = {
                tl: [px, py],
                tr: [px + width, py],
                tc: [cen, py],
                rm: [px + width, mid],
                bc: [cen, py + height],
                lm: [px, mid]
            };
            return ret;
        };
        this.calculate = function() {
            var elem1 = parent.elem1;
            var elem2 = parent.elem2;
            A.width = elem1.width();
            A.height = elem1.height();
            A.coords = getCoords(elem1, A.width, A.height);
            B.width = elem2.width();
            B.height = elem2.height();
            B.coords = getCoords(elem2, B.width, B.height);
            C.sc = A.coords.rm;
            C.ec = B.coords.lm;
            if ((B.coords.tl[0] - A.coords.tl[0] <= 90) && (B.coords.tl[0] - A.coords.tl[0] >= -90)) {
                if (B.coords.tc[1] <= A.coords.tc[1]) {
                    C.sc = A.coords.tc;
                    C.ec = B.coords.bc;
                } else {
                    C.sc = A.coords.bc;
                    C.ec = B.coords.tc;
                }
            } else if (B.coords.tc[0] <= A.coords.tc[0]) {
                C.sc = A.coords.lm;
                C.ec = B.coords.rm;
            }
            C.angleA = Math.atan((C.sc[1] - C.ec[1]) / (C.sc[0] - C.ec[0])) * 180 / Math.PI;
            if (B.coords.tc[0] <= A.coords.tc[0]) {
                C.angleA -= 180;
            }
            C.width = Math.sqrt(Math.pow(C.ec[0] - C.sc[0], 2) + Math.pow(C.ec[1] - C.sc[1], 2));
            makeConnector();
            return parent;
        };
        this.calculate();
        return this;
    };
})(jQuery);

function CustomJsonStringify(object)
{
    var cache = [];
    return JSON.stringify(object, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
}

function getYoutubeId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}

//errorMsg, url, lineNumber
function DisplayErrorPage(errorCode, message, stack)
{
    ToggleLoading(false);
    var newDiv = $('<div/>', {
        id: 'ERRORDIV',
        class: 'container'
    });

    var headline = $('<h1/>', {
        id: 'ERRORCODE',
        text: CustomJsonStringify(errorCode)
    });

    var messageText = $('<h2/>', {
        id: 'ERRORTEXT',
        text: CustomJsonStringify(message)
    });

    var errorStack = $('<h3/>', {
        id: 'ERRORSTACK',
        text: CustomJsonStringify(stack)
    });

    var returnButton = $('<button/>', {
        id: 'RETURN',
        text: "Return To Home",
        href: "/",
        class: "btn btn-success btn-large"
    });

    newDiv.append(headline);
    newDiv.append(messageText);
    newDiv.append(errorStack);
    newDiv.append(returnButton);

    $("#APP").empty().append(newDiv)
}

function ToggleLoading(toggle)
{
    if(toggle)
    {
        //noinspection JSJQueryEfficiency
        if(!$("#loading").hasClass("loading"))
        {
            $("#loading").addClass("loading")
                .removeClass("loading-hidden")
                .transition({scale:1}).transition({opacity:75, duration:500});
        }
    }
    else
    {
        $("#loading").transition({opacity:0, duration:500}).transition({scale:0});
        setTimeout(function(){$("#loading").removeClass("loading").addClass("loading-hidden");},501);
    }
}

window.onerror = DisplayErrorPage;
window.addEventListener('error', function (evt) {
    DisplayErrorPage(evt.message, evt.url, evt.error.stack);
    console.log(evt); // has srcElement / target / etc
    evt.preventDefault();
});

var ClampValue;
/**
 * @return {number}
 */
ClampValue = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
};

window.AppData = {};
window.AppData.UserInfo = {};
window.AppData.defaults = {};

window.AppData.Scenes = {
    Index:{Name:"Index"},
    CharacterCreate:{Name:"CharacterCreate"},
    Course:{Name:"Course"},
    Project:{Name:"Project"}

};

window.AppData.CurrentScene = window.AppData.Scenes.Index;

window.onload = OnPageLoad;

function OnPageLoad()
{

    /*
     Get Logged In/out URL
     Get Character
     Get Enrolled Courses (grades)
     Get Course Info
     GetCurrentGrade
     Get Chart Info
     (Get MinXP for all Grades
     Get XP to Next Level)
     Get Active Character Projects
     DisplayAll
     */

    //Get Logged In/out URL
    APICalls.GetLoggedInOutURL().done(LoginURLCallback);

    var GetCourseInfoDeferred = [];
    var GetLevelChartInfoDeferred = [];
    var LevelChartInfoIDs = [];

    //Get Character
    APICalls.GetCurrentCharacter()
        .then( function (foundChar){
            SaveCharacterInfo(foundChar);
            //Get Enrolled Courses (grades)
            return APICalls.GetEnrolledCourseGrades(window.AppData.UserInfo['character']['urlsafe'])
        }).then(function (FoundCourseGrades){
            var CourseInfoIDs = SaveGradeInfo(FoundCourseGrades);
            //Get Course Info
            GetCourseInfoDeferred.push(APICalls.GetDefaultCourse());
            for(var index = 0; index < CourseInfoIDs.length; index++)
            {
                GetCourseInfoDeferred.push(APICalls.GetCourseInfo(CourseInfoIDs[index]));
            }
            return $.when.apply($, GetCourseInfoDeferred);
        }).done(function(){
            LevelChartInfoIDs = SaveCourseInfo(arguments, GetCourseInfoDeferred.length);
        }).then(function(){
            //Get Chart Info
            for(var index = 0; index < LevelChartInfoIDs.length; index++)
            {
                GetLevelChartInfoDeferred.push(APICalls.GetLevelGradeChart(LevelChartInfoIDs[index]));
            }
            return $.when.apply($, GetLevelChartInfoDeferred);
        }).done(function(){
            SaveLevelChartInfo(arguments, GetLevelChartInfoDeferred.length);
        }).then(function() {
            var deferredCalls = [];
            deferredCalls.push({
                numCallsPerCourse: 9
            });
            for(var index = 0; index < window.AppData.UserInfo['courses'].length; index++)
            {
                //Get MinXP for all Grades
                var courseInfo = window.AppData.UserInfo['courses'][index]['courseInfo'];
                deferredCalls.push({courseIndex: index });
                deferredCalls.push(APICalls.GetMinXpForLevel(courseInfo['chartID'], courseInfo['chartInfo']['MaxLevel']));
                deferredCalls.push(APICalls.GetMinXpForLevel(courseInfo['chartID'], courseInfo['chartInfo']['MinLevel_forA']));
                deferredCalls.push(APICalls.GetMinXpForLevel(courseInfo['chartID'], courseInfo['chartInfo']['MinLevel_forB']));
                deferredCalls.push(APICalls.GetMinXpForLevel(courseInfo['chartID'], courseInfo['chartInfo']['MinLevel_forC']));
                deferredCalls.push(APICalls.GetMinXpForLevel(courseInfo['chartID'], courseInfo['chartInfo']['MinLevel_forD']));
                //Current Grade
                deferredCalls.push(APICalls.GetGrade(courseInfo['chartID'], window.AppData.UserInfo['courses'][index]['xp']));
                //XP to Next Level
                deferredCalls.push(APICalls.GetMinXpForLevel(courseInfo['chartID'], window.AppData.UserInfo['courses'][index]['level'] + 1));
                deferredCalls.push(APICalls.GetMinXpForLevel(courseInfo['chartID'], window.AppData.UserInfo['courses'][index]['level']));
            }
            return $.when.apply($, deferredCalls);
        }).done(function(){
            SaveXPToNextLevel(arguments);
        }).then(function(){
            return $.when(APICalls.GetDefaultProject(), APICalls.GetDefaultCharacterProject(), APICalls.GetSubmittedProjects(window.AppData.UserInfo['character']['urlsafe']));
        }).done(function(defaultProject, defaultCharProject, submittedProjects){
            window.AppData.defaults.project = defaultProject[0];
            window.AppData.defaults.characterProject = defaultCharProject[0];
            SaveSubmittedProjects(submittedProjects);
        }).then(function(){
            var deferredCalls = [];
            for(var index = 0; index < window.AppData.UserInfo['courses'].length; index++)
            {
                deferredCalls.push(APICalls.GetCourseProjects(window.AppData.UserInfo['courses'][index].courseInfo.urlsafe));
            }
            return $.when.apply($, deferredCalls);
        }).done(function(){
            SaveAllCourseProjects(arguments);
            UpdateDisplay();
        })
}

var APICalls = {
//API CALLS ------------------------------------------------------------------------------------------------
    GetLoggedInOutURL: function ()
    {
        ToggleLoading(true);
        return $.getJSON('api/GetLogInOutURL', {url: window.location.pathname})
    },

    GetCurrentCharacter: function ()
    {
        return $.getJSON('api/GetCharacter/current')
    },

    GetCharacterByID: function(characterID)
    {
        return $.getJSON('api/GetCharacter/byKey', {
            characterID:characterID
        })
    },

    UpdateCharacter: function(updatedCharacter)
    {
        var updatedArgs = [];

        for (var property in updatedCharacter)
        {
            if (updatedCharacter.hasOwnProperty(property))
            {
                if(updatedCharacter[property] instanceof Array)
                {
                    for(var i=0; i < updatedCharacter[property].length; i++)
                    {
                        updatedArgs.push(property.replace('[]','') + ':' + updatedCharacter[property][i].toString());
                    }
                }
                else
                {
                    updatedArgs.push(property + ':' + updatedCharacter[property].toString());
                }
            }
        }

        return $.getJSON('api/SetCharacter/update', {
            userID:window.AppData.UserInfo.character.userID,
            updatedArgs:updatedArgs
        })
    },

    UpdateProject: function(updatedProject)
    {
        var updatedArgs = [];

        for (var property in updatedProject)
        {
            if (updatedProject.hasOwnProperty(property))
            {
                if(updatedProject[property] instanceof Array)
                {
                    for(var i=0; i < updatedProject[property].length; i++)
                    {
                        updatedArgs.push(property.replace('[]','') + ':' + updatedProject[property][i].toString());
                    }
                }
                else
                {
                    updatedArgs.push(property + ':' + updatedProject[property].toString());
                }
            }
        }

        return $.getJSON('api/SetProject/update', {
            projectID:updatedProject.urlsafe,
            updatedArgs:updatedArgs
        })
    },

    DeleteProject: function(deleteKey)
    {
         return $.getJSON('api/SetProject/delete', {
            projectID:deleteKey
        })
    },

    DeleteSubmission: function(DeleteUrlSafe)
    {
        return $.getJSON('api/SetCharacterProject/delete', {
            characterProjectID:deleteKey
        })
    },

    GetGuestCharacter: function ()
    {
        return $.getJSON('api/GetCharacter/guest')
    },

    CreateNewCharacter: function (newCharacter)
    {
        return $.getJSON('api/SetCharacter/new', {
            pFullName: newCharacter["fullname"],
            pUsername: newCharacter["username"],
            avatarURL: newCharacter["avatar"]
        })
    },

    GetEnrolledCourseGrades: function (characterIntKey)
    {
        return $.getJSON('api/GetCharacterGrade/enrolled', {
            characterKey: characterIntKey
        })
    },

    EnrollInCourse: function (courseKey)
    {
        return $.getJSON('api/SetCharacterGrade/new', {
            k_courseID: courseKey,
            k_characterID: window.AppData.UserInfo.character.urlsafe
        })
    },

    GetDefaultCourse: function ()
    {
        return $.getJSON('api/GetCourse/default/debug')
    },

    GetAllCourses: function ()
    {
        return $.getJSON('api/GetCourse/All')
    },

    UpdateCourse: function(updatedCourse)
    {
        var updatedArgs = [];

        for (var property in updatedCourse)
        {
            if (updatedCourse.hasOwnProperty(property))
            {
                if(updatedCourse[property] instanceof Array)
                {
                    for(var i=0; i < updatedCourse[property].length; i++)
                    {
                        updatedArgs.push(property.replace('[]','') + ':' + updatedCourse[property][i].toString());
                    }
                }
                else
                {
                    updatedArgs.push(property + ':' + updatedCourse[property].toString());
                }
            }
        }
        return $.getJSON('api/SetCourse/update',
            {
                courseID: updatedCourse.urlsafe,
                updatedArgs: updatedArgs
            })
    },

    GetCourseInfo: function (courseKey)
    {
        return $.getJSON('api/GetCourse', {
            id: courseKey
        })
    },

    AddNewCourse: function (newCourseObject)
    {
        return $.getJSON('api/SetCourse/new', {
            name: newCourseObject.Name,
            number: newCourseObject.courseNumber,
            description: newCourseObject.Description,
            syllabusLink: newCourseObject.syllabusLink,
            pIconID: newCourseObject.IconID,
            k_chartID: newCourseObject.chartID
        })
    },

    GetCourseProjects: function (courseKey)
    {
        return $.getJSON('api/GetProject/byCourse', {
            courseKey: courseKey
        })
    },

    GetAllProjects: function ()
    {
        return $.getJSON('api/GetProject/all/debug')
    },

    GetDefaultProject: function ()
    {
        return $.getJSON('api/GetProject/default/debug')
    },

    AddNewProject: function (projectObject)
    {
        return $.getJSON('api/SetProject/new', {
            k_characterID: projectObject.owningCharacter,
            s_name: projectObject.projectName,
            i_level: projectObject.level,
            s_challengeLevel: projectObject.ChallengeLevel,
            s_description: projectObject.description,
            s_videoURL: projectObject.videoURL,
            s_attachmentList:projectObject.attachments,
            s_requirementList:projectObject.requirements,
            k_prereqList:projectObject.prerequisiteProjectIDs,
            k_courseID: projectObject.courseKey
        })
    },

    GetProjectsByCharacter: function (CharacterID)
    {
        return $.getJSON('api/GetProject/byCharacter', {
            characterID: CharacterID
        })
    },

    GetSubmittedProjects: function (CharacterID)
    {
        return $.getJSON('api/GetCharacterProject/bycharacter', {
            characterID: CharacterID
        })
    },

    GetSubmittedProjectsByCourse: function (CourseID)
    {
        return $.getJSON('api/GetCharacterProject/bycourse', {
            courseID: CourseID
        })
    },

    StartProject: function (newSubmission)
    {
        AddSubmittedProject(newSubmission);
        $('#course_'+newSubmission.CourseID).trigger('click');
        $("#"+window.AppData.SelectedProject.urlsafe).children('button').trigger('click');
        return $.getJSON('api/SetCharacterProject/new', {
            k_projectID: newSubmission.ProjectID,
            k_characterID: newSubmission.CharacterID,
            l_submissionLinks:newSubmission.SubmissionLinks
        })
    },

    SubmitProject: function (newSubmission)
    {
        AddSubmittedProject(newSubmission);
        window.AppData.SelectedProject.submission = [newSubmission];
        $('#course_'+newSubmission.CourseID).trigger('click');
        $("#"+window.AppData.SelectedProject.urlsafe).children('button').trigger('click');
        return $.getJSON('api/SetCharacterProject/submit', {
            submittedProjectID: newSubmission.urlsafe,
            k_projectID: newSubmission.ProjectID,
            k_characterID: newSubmission.CharacterID,
            submissionLinks:newSubmission.SubmissionLinks
        })
    },

    RejectProject: function(submissionID)
    {
        return $.getJSON('api/SetCharacterProject/reject', {
            submittedProjectID: submissionID
        })
    },

    ApproveProject: function(submissionID)
    {
        return $.getJSON('api/SetCharacterProject/approve', {
            submittedProjectID: submissionID
        })
    },

    GetDefaultCharacterProject: function()
    {
        return $.getJSON('api/GetCharacterProject/default/debug')
    },

    GetMinXpForLevel: function (levelChartID, nextLevelNum)
    {
        return $.getJSON('api/GetLevelGradeChart/minxp', {
            chartID: levelChartID,
            levelNum: nextLevelNum
        })
    },

    GetGrade: function (levelChartID, xpAmount)
    {
        return $.getJSON('api/GetLevelGradeChart/grade', {
            chartID: levelChartID,
            xpAmount: xpAmount
        })
    },

    GetLevelGradeChart: function(levelChartID)
    {
        return $.getJSON('api/GetLevelGradeChart', {
            id: levelChartID
        })
    }
//END API CALLS --------------------------------------------------------------------------------------------
};


function GetCourseIndexByKey(courseKey)
{
    for(var i = 0; i < window.AppData.UserInfo.courses.length; i++)
    {
        if(window.AppData.UserInfo.courses[i].courseKey == courseKey)
        {
            return i;
        }
    }
    return -1;
}

function LoginURLCallback(IsLoggedInCallback)
{
    window.AppData.UserInfo['loginButton'] = {text:IsLoggedInCallback['text'], url: IsLoggedInCallback['url']};
    window.AppData.UserInfo['user'] = {email:IsLoggedInCallback['studentEmail']};

    AddLogInOutButton(window.AppData.UserInfo['loginButton']['text'], window.AppData.UserInfo['loginButton']['url'], window.AppData.UserInfo['user']['email']);
}

function AddLogInOutButton(linkText, url, studentName)
{
    $("#studentName").text(studentName);

    var newlink = $('<a/>', {
        href: url,
        text: linkText
    });

    var loginOutLink = $('<li/>', {}).append(newlink);

    $('#studentDropdownList').append(loginOutLink);
}

function SaveCharacterInfo(characterCallback)
{
    window.AppData.UserInfo['character'] = characterCallback;
    //GetEnrolledCourseGrades(window.AppData.UserInfo['character']['urlsafe'], SaveGradeInfo)
    //DecrementLoadCall();
}

function DisplayCharacterInfo()
{
    try
    {
        $("#avatar").attr('src', window.AppData.UserInfo['character']['avatar']);
        $("#characterName").text(window.AppData.UserInfo['character']['username']);


        if(window.AppData.UserInfo['character']['username'] == "GUEST")
        {
            $("#editBTN").hide();
        }
        else
        {
            $("#editBTN").off("click").click(function(){
                DisplayGenericEditor(window.AppData.UserInfo['character'], "Edit Character", function(newCharcter){
                    newCharcter.isAdmin = typeof newCharcter.isAdmin == "boolean" ? newCharcter.isAdmin : newCharcter.isAdmin.toUpperCase() == "TRUE";
                    APICalls.UpdateCharacter(newCharcter);
                    UpdateDisplay();
                }, {}, {
                    disableAllExcept:true,
                    fields: ['username', 'fullName', 'avatar']
                });
            })
        }
    }
    catch (ex)
    {
        console.log(ex);
        DisplayErrorPage("DisplayCharacter Failure", ex.toString(), ex.stack);
    }
}

function SaveGradeInfo(enrolledGradesCallbackData)
{
    var CourseIDs = [];
    window.AppData.UserInfo.courses = [];
    if(enrolledGradesCallbackData != null)
    {
        for(var i = 0; i < enrolledGradesCallbackData.length; i++)
        {
            enrolledGradesCallbackData[i]['enrolledDate'] = new Date(enrolledGradesCallbackData[i]['enrolledDate'] * 1000)
            window.AppData.UserInfo.courses.push(enrolledGradesCallbackData[i]);
            CourseIDs.push(enrolledGradesCallbackData[i]['courseKey']);
        }
    }
    return CourseIDs;
}

function SaveCourseInfo(courseCallbackData, count)
{
    if(count == 1)
    {
        courseCallbackData = [courseCallbackData];
    }

    window.AppData.defaults.course = courseCallbackData[0][0];

    var LevelChartIDs = [];
    for(var i = 0; i < window.AppData.UserInfo['courses'].length; i++)
    {
        for(var j = 1; j < courseCallbackData.length; j++)
        {
            if (window.AppData.UserInfo['courses'][i]['courseKey'] == courseCallbackData[j][0]['urlsafe'])
            {
                window.AppData.UserInfo['courses'][i]['courseInfo'] = courseCallbackData[j][0];
                LevelChartIDs.push(window.AppData.UserInfo['courses'][i]['courseInfo']['chartID']);
                break;
            }
        }
    }
    return LevelChartIDs;
}

function SaveLevelChartInfo(levelChartCallbackData, count)
{
    if(count == 1)
    {
        levelChartCallbackData = [levelChartCallbackData];
    }
    var LevelChartIDs = [];
    for(var i = 0; i < window.AppData.UserInfo['courses'].length; i++)
    {
        for(var j = 0; j < levelChartCallbackData.length; j++)
        {
            if (window.AppData.UserInfo['courses'][i]['courseInfo']['chartID'] == levelChartCallbackData[j][0]['urlsafe'])
            {
                window.AppData.UserInfo['courses'][i]['courseInfo']['chartInfo'] = levelChartCallbackData[j][0];
                LevelChartIDs.push(window.AppData.UserInfo['courses'][i]['courseInfo']['chartID']);
                break;
            }
        }
    }
    return LevelChartIDs;
}

function SaveXPToNextLevel(xpCallbacks)
{
    var callsPerCourse = xpCallbacks[0]['numCallsPerCourse'];
    for(var j = 1; j < xpCallbacks.length; j+=callsPerCourse)
    {
        var courseIndex = xpCallbacks[j]['courseIndex'];

        var progressInfo  = {};

        progressInfo['XpForMaxLevel'] = xpCallbacks[j+1][0];
        progressInfo['MinLevel_forA'] = xpCallbacks[j+2][0];
        progressInfo['MinLevel_forB'] = xpCallbacks[j+3][0];
        progressInfo['MinLevel_forC'] = xpCallbacks[j+4][0];
        progressInfo['MinLevel_forD'] = xpCallbacks[j+5][0];
        progressInfo['CurrentGrade'] = xpCallbacks[j+6][0];
        progressInfo['XpForNextLevel'] = xpCallbacks[j+7][0];
        progressInfo['XpForCurrentLevel'] = xpCallbacks[j+8][0];
        progressInfo['XpToNextLevel'] = progressInfo['XpForNextLevel'] - window.AppData.UserInfo.courses[courseIndex].xp;

        window.AppData.UserInfo['courses'][courseIndex].progressInfo = progressInfo;
    }
}

function SaveSubmittedProjects(ProjectsCallback)
{
    if(ProjectsCallback[1] == 'success')
    {
        ProjectsCallback = [ProjectsCallback];
    }

    var lookupTable = {};
    for(var index = 0; index < window.AppData.UserInfo['courses'].length; index++)
    {
        window.AppData.UserInfo['courses'][index].SubmittedProjects = {};
        lookupTable[window.AppData.UserInfo['courses'][index].courseKey] = window.AppData.UserInfo['courses'][index].SubmittedProjects;
    }
    if(ProjectsCallback[0][0] == null)
    {
        return;
    }
    for(var i = 0; i < ProjectsCallback[0][0].length; i++)
    {
        if("CourseID" in ProjectsCallback[0][0][i])
        {
            if(lookupTable[ProjectsCallback[0][0][i].CourseID][ProjectsCallback[0][0][i].ProjectID])
            {
                lookupTable[ProjectsCallback[0][0][i].CourseID][ProjectsCallback[0][0][i].ProjectID].push(ProjectsCallback[0][0][i]);
            }
            else
            {
                lookupTable[ProjectsCallback[0][0][i].CourseID][ProjectsCallback[0][0][i].ProjectID] = [];
                lookupTable[ProjectsCallback[0][0][i].CourseID][ProjectsCallback[0][0][i].ProjectID].push(ProjectsCallback[0][0][i]);
            }
        }
    }
}

function SaveAllCourseProjects(courseProjectsCallback)
{
    if(courseProjectsCallback.length == 3 && courseProjectsCallback[1] == 'success')
    {
        courseProjectsCallback = [courseProjectsCallback];
    }

    for(var courseIndex = 0; courseIndex < window.AppData.UserInfo['courses'].length; courseIndex++)
    {
        window.AppData.UserInfo['courses'][courseIndex].courseInfo.projects = [];
    }

    for(var index = 0; index < courseProjectsCallback.length; index++)
    {
        SaveCourseProjectCallback(courseProjectsCallback[index][0]);
    }
}

function SaveCourseProjectCallback(projectCallback)
{
    if(projectCallback.length == 0)
    {
        return;
    }
    var courseIndex = GetCourseIndexByKey(projectCallback[0].courseKey);
    window.AppData.UserInfo['courses'][courseIndex].courseInfo.projects = [];

    for(var projIndex = 0; projIndex < projectCallback.length; projIndex++)
    {
        window.AppData.UserInfo['courses'][courseIndex].courseInfo.projects.push(projectCallback[projIndex]);
    }
}

function UpdateDisplay()
{
    ToggleLoading(true);
    //reset page
    var currentScene = window.AppData.CurrentScene;
    ResetUI(currentScene);
    //Init Char Panel
    DisplayCharacterInfo();
    $('#enrollBTN').remove();
    var enrollInCourseButton = $('<button/>').attr('id', 'enrollBTN').text("Enroll").addClass('btn btn-warning').click(DisplayEnrollClassEditor);
    enrollInCourseButton.insertBefore($('#ClassSection'));

    if(window.AppData.UserInfo.character.isAdmin)
    {
        $("#NewCourseButton").remove();
        var NewCourseButton = $('<button/>', {
            class:'btn btn-info',
            id:"NewCourseButton"
        });
        NewCourseButton.text('add ').append('<span class="glyphicon glyphicon-plus"></span>');

        var newCourse = {};
        jQuery.extend(newCourse,window.AppData.defaults.course);
        NewCourseButton.click(function(){
            DisplayGenericEditor(newCourse, "New Course", new function(course){
                APICalls.AddNewCourse(course);
            });
        });

        NewCourseButton.insertBefore($('#ClassSection'));
    }
    for(var index = 0; index < window.AppData.UserInfo.courses.length; index++)
    {
        DisplayCourse(window.AppData.UserInfo.courses[index]);
    }

    ToggleLoading(false);
}

function ResetUI(scene)
{
    ClearClassSection();
    ClearInspectorWindow();
}

function ClearClassSection()
{$("#ClassSection").children().not("#sampleClass").remove();}

function ClearInspectorWindow()
{$("#InspectorWindow").children().remove();}

function DisplayCourse(course)
{
    var percentToNextLevel = ((course.xp / course.progressInfo.XpForNextLevel)*100);
    var percentToMaxXP = ((course.xp / course.progressInfo.XpForMaxLevel)*100);

    var XpToD = ClampValue(course.progressInfo.MinLevel_forD - course.xp, 0, course.progressInfo.MinLevel_forD);
    var XpToC = ClampValue(course.progressInfo.MinLevel_forC - Math.max(course.xp, course.progressInfo.MinLevel_forD), 0, course.progressInfo.MinLevel_forC);
    var XpToB = ClampValue(course.progressInfo.MinLevel_forB - Math.max(course.xp, course.progressInfo.MinLevel_forC), 0, course.progressInfo.MinLevel_forB);
    var XpToA = ClampValue(course.progressInfo.MinLevel_forA - Math.max(course.xp, course.progressInfo.MinLevel_forB), 0, course.progressInfo.MinLevel_forA);
    var XpToMax = ClampValue(course.progressInfo.XpForMaxLevel - Math.max(course.xp, course.progressInfo.MinLevel_forA), 0, course.progressInfo.XpForMaxLevel);

    var D_Percent = ((XpToD / course.progressInfo.XpForMaxLevel)*100);
    var C_Percent = (((XpToC) / course.progressInfo.XpForMaxLevel)*100);
    var B_Percent = (((XpToB) / course.progressInfo.XpForMaxLevel)*100);
    var A_Percent = (((XpToA) / course.progressInfo.XpForMaxLevel)*100);
    var Max_Percent = (((XpToMax) / course.progressInfo.XpForMaxLevel)*100);
    //console.log(D_Percent + C_Percent + B_Percent + A_Percent + Max_Percent + percentToMaxXP);

    $('#sampleClass').clone()
        .appendTo('#ClassSection')
        .removeClass("hidden")
        .attr('id', course['courseInfo']['Name'])
        .find('[name=ClassName]').text(course.courseInfo.Name).append("<button class='btn btn-sm btn-info pull-right' id='course_"+course.courseKey+"'>view</button>")
        .find('button').click(course.courseInfo.urlsafe, DisplayCoursePage).end().end()
        .find('[name=Level]').text(course.level).end()
        .find('[name=TotalXP]').text(course.xp).end()
        .find('[name=Grade]').text(course.progressInfo.CurrentGrade).end()
        .find('[name=XpToNextLevelProgressBar]')
        .attr('aria-valuenow', course.xp)
        .attr('aria-valuemin', course.progressInfo.XpForCurrentLevel)
        .attr('aria-valuemax', course.progressInfo.XpForNextLevel)
        .attr('style', "width: " + percentToNextLevel.toString() + "%").end()
        .find('[name=XpToNextLevel]').text(course.progressInfo.XpToNextLevel.toString() + "xp").end()
        .find('[name=CurrentGradeBar]').attr("title", "Current XP: " + course.xp.toString())
        .attr('style', 'width: ' + percentToMaxXP.toString() + "%")
        .find('[name=XpToNextGrade]').text(XpToD).end().end()
        .find('[name=F_GradeBar]').attr("title", "XP to D: " + XpToD.toString())
        .attr('style', 'width: ' + D_Percent.toString() + "%").end()
        .find('[name=D_GradeBar]').attr("title", "XP to C: " + XpToC.toString())
        .attr('style', 'width: ' + C_Percent.toString() + "%").end()
        .find('[name=C_GradeBar]').attr("title", "XP to B: " + XpToB.toString())
        .attr('style', 'width: ' + B_Percent.toString() + "%").end()
        .find('[name=B_GradeBar]').attr("title", "XP to A: " + XpToA.toString())
        .attr('style', 'width: ' + A_Percent.toString() + "%").end()
        .find('[name=A_GradeBar]').attr('style', 'width: ' + Max_Percent.toString() + "%").end();

    $('.progress-bar').tooltip();
}

function DisplayXPtoGrade(xpToGradeCallback)
{

}

function DisplayActiveProjects(ActiveProjectsCallback)
{

}

function CreateProjectButton(projectInfo)
{
    var newProject = $('<div/>', {
        class: 'thumbnail',
        name: projectInfo.projectName
    });
    var projectCaption = $('<div/>', {
        class: 'caption'
    });

    projectCaption.append($('<h3/>', {
        text: projectInfo.projectName
    }));

    projectCaption.append($('<p/>', {
        text: projectInfo.description
    }));

    var startBTN = $('<a/>', {
        class: 'btn btn-primary',
        role: 'button',
        data: projectInfo.urlsafe
    });

    var submitBTN = $('<a/>', {
        class: 'btn btn-success',
        role: 'button',
        data: projectInfo.urlsafe
    });
    var buttonContainer = $('<p/>', {
        text: projectInfo.description
    }).append(startBTN).append(submitBTN);

    projectCaption.append(buttonContainer);

    newProject.append(projectCaption);

    return newProject
}

function DisplayCoursePage(CourseKey)
{
    if(CourseKey.hasOwnProperty('data'))
    {
        CourseKey = CourseKey.data;
    }

    ClearInspectorWindow();

    var courseIndex = -1;
    for(var i = 0; i < window.AppData.UserInfo.courses.length; i++)
    {
        if(window.AppData.UserInfo.courses[i].courseInfo.urlsafe == CourseKey)
        {
            courseIndex = i;
            break;
        }
    }

    var CourseDiv = $('<div/>', {
        id: 'Inspector_' + window.AppData.UserInfo.courses[courseIndex].courseInfo.Name,
        class: 'container-fluid'
    });
    var HeaderDiv = $('<div/>', {
        id: 'CourseHeader',
        class: 'page-header'
    });
    if(window.AppData.UserInfo.character.isAdmin)
    {
        HeaderDiv.append($("<button/>").click(function(){
            DisplayGenericEditor(window.AppData.UserInfo.courses[courseIndex].courseInfo, "Edit Course", function(newCourse){
                APICalls.UpdateCourse(newCourse);
                DisplayCoursePage(newCourse.urlsafe);
            });
        }).addClass('btn btn-warning pull-right').text('edit ').append('<span class="glyphicon glyphicon-pencil"></span>'));
    }

    HeaderDiv.append("<h1>"+window.AppData.UserInfo.courses[courseIndex].courseInfo.Name+"</br><small>"+window.AppData.UserInfo.courses[courseIndex].courseInfo.Description+"</small></h1>");

    var projectsDiv = $('<div/>').addClass('row');

    var allProjects = $('<div/>', {
        id: 'AllCourseProjects',
        class: 'well well-lg tree col-lg-7 col-md-7 col-xs-12',
        style: 'min-height: 400px; max-height: 600px; overflow-y: scroll; overflow-x: scroll; padding-top:10px;'
    });
    var SelectedProject = $('<div/>', {
        id: 'SelectedProject',
        class: 'well well-sm col-lg-5 col-md-5 col-xs-12',
        style: 'padding-top:10px; min-height: 400px; max-height: 600px; overflow-y: scroll'
    });

    projectsDiv.append(allProjects);
    projectsDiv.append(SelectedProject);

    var NewProjectButton = $('<button/>', {
        class:'btn btn-warning btn-sm'
    });
    NewProjectButton.text('add ').append('<span class="glyphicon glyphicon-plus"></span>');

    var newProjectObject = {};
    jQuery.extend(newProjectObject,window.AppData.defaults.project);
    NewProjectButton.click(function(){
        var defaultPrereq = [];
        if(window.AppData.SelectedProject && window.AppData.SelectedProject.data.courseKey == window.AppData.UserInfo.courses[courseIndex].courseInfo.urlsafe)
        {
            defaultPrereq = [window.AppData.SelectedProject.urlsafe];
        }
        DisplayGenericEditor(newProjectObject, "New Project", function(newProject){
            APICalls.AddNewProject(newProject).then(function(){
                APICalls.GetCourseProjects(newProject.courseKey).then(function(callback){
                    SaveCourseProjectCallback(callback);
                    var courseIndex = GetCourseIndexByKey(newProject.courseKey);
                    window.AppData.UserInfo.courses[courseIndex].courseInfo.SortedProjects = SortProjects(window.AppData.UserInfo.courses[courseIndex].courseInfo.projects, window.AppData.UserInfo.courses[courseIndex].SubmittedProjects);
                    $('#course_'+newProject.courseKey).trigger('click');
                    if(window.AppData.SelectedProject)
                    {
                        $("#"+window.AppData.SelectedProject.urlsafe).children('button').trigger('click');
                    }
                })
            });
        }, {
            courseKey:window.AppData.UserInfo.courses[courseIndex].courseInfo.urlsafe,
            owningCharacter:window.AppData.UserInfo.character.urlsafe,
            prerequisiteProjectIDs:defaultPrereq,
            ChallengeLevel:"normal"
        }, {
            fields: ['courseKey', 'owningCharacter']
        })
    });
    window.AppData.ZoomAmount = 1;
    var zoomInButton = $('<button/>', {
        class:'btn btn-info btn-sm'
    });

    zoomInButton.click(function(){
        window.AppData.ZoomAmount += 0.25;
        window.AppData.ZoomAmount = Math.min(window.AppData.ZoomAmount, 2);
       $('#AllCourseProjects').children('ul').css('transform', 'scale('+window.AppData.ZoomAmount+')');
    });

    zoomInButton.append('<span class="glyphicon glyphicon-zoom-in"></span>');

    var zoomOutButton = $('<button/>', {
        class:'btn btn-info btn-sm'
    });

    zoomOutButton.click(function(){
       window.AppData.ZoomAmount -= 0.25;
       window.AppData.ZoomAmount = Math.max(window.AppData.ZoomAmount, 0.1);
       $('#AllCourseProjects').children('ul').css('transform', 'scale('+window.AppData.ZoomAmount+')');
    });

    zoomOutButton.append('<span class="glyphicon glyphicon-zoom-out"></span>');


    var rootProjectList = $('<ul/>', {style:'white-space:nowrap;'}).addClass('list-inline');

    if(!window.AppData.UserInfo.courses[courseIndex].courseInfo.hasOwnProperty("SortedProjects"))
    {
        window.AppData.UserInfo.courses[courseIndex].courseInfo.SortedProjects = SortProjects(window.AppData.UserInfo.courses[courseIndex].courseInfo.projects, window.AppData.UserInfo.courses[courseIndex].SubmittedProjects);
    }

    rootProjectList.append(GetSortedProjectList(window.AppData.UserInfo.courses[courseIndex].courseInfo.SortedProjects));
    allProjects.append(rootProjectList);

    var activeProjects = $('<div/>', {
        id: 'ActiveCourseProjects',
        class: 'list-group'
    });

    CourseDiv.append(HeaderDiv);
    CourseDiv.append(NewProjectButton);
    CourseDiv.append(zoomInButton);
    CourseDiv.append(zoomOutButton);
    CourseDiv.append(projectsDiv);
    if(window.AppData.UserInfo.character.isAdmin)
    {
        var AdminPanel = $('<div/>', {
            id: 'AdminPanel',
            class: 'well well-lg',
            style: 'min-height: 400px; overflow-y: scroll; overflow-x: scroll; padding-top:10px'
        });

        var submittedProjectList = $('<ul/>', {id:'allSubmissions'}).addClass('list-inline');

        APICalls.GetSubmittedProjectsByCourse(window.AppData.UserInfo.courses[courseIndex].courseKey).then(function(results){
            var DeferredCalls = [];
            window.AppData.AdminSubmissions = [];
            for(var i = 0; i < results.length; i++)
            {
                if(results[i].Status == "UnderReview")
                {
                    window.AppData.AdminSubmissions.push(results[i]);
                    DeferredCalls.push(APICalls.GetCharacterByID(results[i].CharacterID));
                }
            }
            return $.when.apply($, DeferredCalls);
        }).done(function(){
                var returnValues = [];
                if(arguments[1] == 'success')
                {
                    returnValues.push(arguments);
                }
                else
                {
                    returnValues = arguments;
                }
                for(var i = 0; i < returnValues.length; i++)
                {
                    window.AppData.AdminSubmissions[i].characterInfo = returnValues[i][0];
                    submittedProjectList.append(DisplaySubmission(window.AppData.AdminSubmissions[i]));
                }
            });

        AdminPanel.append(submittedProjectList);
        CourseDiv.append(AdminPanel);
    }
    CourseDiv.append(activeProjects);
    $('#InspectorWindow').append(CourseDiv);
    window.AppData.connections = [];
    //DrawConnections(SortedProjects);
}

function DrawConnections(treeNode)
{
    for(var j=0; j < treeNode.children.length; j++)
    {
        if(treeNode.urlsafe != 'root')
        {
            window.AppData.connections.push(new $.connect('#'+treeNode.children[j].urlsafe, '#'+treeNode.urlsafe, {container:'#AllCourseProjects', leftLabel:'', rightLabel:''}));
        }
        DrawConnections(treeNode.children[j]);
    }
}

function FindProjectInTree(treenode, urlsafe)
{
    if(treenode.urlsafe == urlsafe)
    {
        return treenode;
    }

    for(var i = 0; i < treenode.children.length; i++)
    {
        var foundProj = FindProjectInTree(treenode.children[i], urlsafe);
        if(foundProj != null)
        {
            return foundProj;
        }
    }
    return null;
}

function FindParentProjectInTree(treenode, urlsafe)
{
    if(treenode.urlsafe == urlsafe)
    {
        return treenode;
    }

    for(var i = 0; i < treenode.children.length; i++)
    {
        var foundProj = FindParentProjectInTree(treenode.children[i], urlsafe);
        if(foundProj != null && foundProj.hasOwnProperty('data'))
        {
            return {node:treenode, childIndex:i};
        }
        else if(foundProj != null)
        {
            return foundProj
        }
    }
    return null;
}

function PopFoundNodes(parentNode, treeNode, prereqChildren, prereqUrlSafe)
{
    if(treeNode.urlsafe != 'root' && treeNode.data.prerequisiteProjectIDs.length > 0 && treeNode.data.prerequisiteProjectIDs[0] == prereqUrlSafe)
    {
        if(parentNode != null)
        {
            var index = $.inArray(treeNode, parentNode.children);
            parentNode.children.splice(index,1);
        }

        prereqChildren.push(treeNode);
        return prereqChildren;
    }

    for(var i = 0; i < treeNode.children.length; i++)
    {
        var foundChildren = PopFoundNodes(treeNode, treeNode.children[i], prereqChildren, prereqUrlSafe);
        if(foundChildren != null)
        {
            return foundChildren;
        }
    }
    return null;
}

function DisplaySubmission(submission)
{
    var projectItem = $('<li/>', {style:'text-align:center; vertical-align: top;margin-left: 10px;margin-right: 10px;'}).attr('urlsafe', submission.urlsafe).attr('id', submission.urlsafe);

    var project = GetProjectByKey(submission.CourseID, submission.ProjectID);

    if(project == null)
    {
        //APICalls.DeleteSubmission(submission.urlsafe);
        return;
    }

    if(submission.Status != "UnderReview")
    {
        return "";
    }

    projectItem.append($('<button/>').text(submission.characterInfo.fullName + ":" + project.projectName).addClass('btn btn-primary btn-lg').click(submission, function(selectedNode) {
            if(window.AppData.SelectedAdminProject)
            {
                $("#"+window.AppData.SelectedAdminProject.urlsafe).children('div').remove();
            }
            window.AppData.SelectedAdminProject = selectedNode.data;

            var thumbnail = $('<div/>').addClass('thumbnail');
            var icon = $('<img/>', {src:window.AppData.SelectedAdminProject.characterInfo.avatar, style:"width:50%"}).addClass("img-responsive img-circle");
            var caption = $('<div/>').addClass('caption text-left');
            caption.append($('<h3/>').text(project.projectName));
            caption.append($('<p/>').text(project.description));
            caption.append($('<button/>').text("Project Key").addClass('btn btn-xs btn-info').click(project.urlsafe, function(click){
                window.prompt("Copy to clipboard: Ctrl+C, Enter", click.data);
            }));

            caption.append($('<p/>').text("Level: "+project.level));
            caption.append($('<p/>').text("Challenge: "+project.ChallengeLevel));

            if(project.requirements.length > 0)
            {
                var requirementsList = $('<ul/>', {style:'max-width:400px; overflow-x:auto;'});
                for(var j =0; j < project.requirements.length; j++)
                {
                    requirementsList.append($('<li/>').text(project.requirements[j]));
                }
                caption.append('<h4>Requirements</h4>');
                caption.append(requirementsList);
            }

            if(window.AppData.SelectedAdminProject.SubmissionLinks.length > 0)
            {
                var submissionList = $('<ul/>', {style:'max-width:400px; overflow-x:auto;'});
                for(var j =0; j < window.AppData.SelectedAdminProject.SubmissionLinks.length; j++)
                {
                    submissionList.append($('<li/>').append($('<a/>',{href:window.AppData.SelectedAdminProject.SubmissionLinks[j]}).text(window.AppData.SelectedAdminProject.SubmissionLinks[j])));
                }
                caption.append('<h4>Submission Links</h4>');
                caption.append(submissionList);
            }

            var projectButtonContainer = $('<div/>', {style:'max-width:400px'}).addClass('btn-group btn-group-justified');
            var ApproveBTN = $('<div/>').addClass('btn-group').append(
                $('<button/>').addClass('btn btn-success').text("Approve ").attr('submittedProjectID', window.AppData.SelectedAdminProject.urlsafe).append('<span class="glyphicon glyphicon-thumbs-up"></span>').click(function(){
                    APICalls.ApproveProject($(this).attr('submittedProjectID'));
                    projectButtonContainer.find('.btn-danger').parent().remove();
                    $(this).prop('disabled', true);
                })
            );
            var RejectBTN = $('<div/>').addClass('btn-group').append(
                $('<button/>').addClass('btn btn-danger').text("Reject ").attr('submittedProjectID', window.AppData.SelectedAdminProject.urlsafe).append('<span class="glyphicon glyphicon-thumbs-down"></span>').click(function(){
                    APICalls.RejectProject($(this).attr('submittedProjectID'));
                    projectButtonContainer.find('.btn-success').parent().remove();
                    $(this).prop('disabled', true);
                })
            );
            projectButtonContainer.append(ApproveBTN);
            projectButtonContainer.append(RejectBTN);
            caption.append(projectButtonContainer);

            thumbnail.append(icon);
            thumbnail.append(caption);
            $("#"+window.AppData.SelectedAdminProject.urlsafe).append(thumbnail);
        }
    ));

    return projectItem;
}

function GetSortedProjectList(projectTreeNode)
{
    if(projectTreeNode == null || (projectTreeNode.urlsafe == 'root' && projectTreeNode.children.length == 0))
    {
        return "<h2>There are no projects available for this course.</h2><h3>Please wait for the instructor to add them OR add your own!</h3>";
    }
    var projectItem = $('<li/>', {style:'text-align:center; vertical-align: top; display:inline-block'}).attr('urlsafe', projectTreeNode.urlsafe).attr('id', projectTreeNode.urlsafe);
    if(projectTreeNode.urlsafe != 'root')
    {
        var mostRecentSubmission = GetMostRecentSubmission(projectTreeNode.submission);
        var buttonColorClass = "btn-primary";
        if(mostRecentSubmission)
        {
            switch(mostRecentSubmission.Status)
            {
                 case "UnderReview":
                    buttonColorClass = "btn-warning";
                    break;
                case 'Complete':
                    buttonColorClass = "btn-success";
                    break;
                case 'InProgress':
                    buttonColorClass = "btn-info";
                    break;
                case 'Rejected':
                    buttonColorClass = "btn-danger";
                    break;
                default :
                    buttonColorClass = "btn-primary";
                    break;
            }
        }
        if(window.AppData.UserInfo.character.isAdmin || projectTreeNode.data.owningCharacter == window.AppData.UserInfo.character.urlsafe)
        {
            var projectName = projectTreeNode.data.owningCharacterName + ":" + projectTreeNode.data.projectName;
        }
        else{
            var projectName = projectTreeNode.data.projectName;
        }

        var projectBTN = $('<button/>').text(projectName).addClass('btn btn-lg '+buttonColorClass).click(projectTreeNode, function(selectedNode) {
                if(window.AppData.SelectedProject)
                {
                    $("#"+window.AppData.SelectedProject.urlsafe).children('button').removeClass("active");
                }
                window.AppData.SelectedProject = selectedNode.data;
                $("#"+window.AppData.SelectedProject.urlsafe).children('button').addClass("active");

                $('#SelectedProject').empty().append(GetProjectDisplay(window.AppData.SelectedProject));
            });

        projectBTN.attr('data-toggle', 'collapse').attr('data-parent', '#'+projectTreeNode.urlsafe).attr('href', '#UL_'+projectTreeNode.urlsafe);

        if(projectTreeNode.children.length > 0)
        {
            projectBTN.append('<span class="glyphicon glyphicon-expand" style="padding-left: 5px"></span>');
        }

        projectItem.append(projectBTN)
    }

    var childList = $('<ul/>').addClass('list-inline').attr('id', "UL_"+projectTreeNode.urlsafe).on('show.bs.collapse', function() {
                $(this).parent().children('button').children('span').removeClass("glyphicon-expand").addClass('glyphicon-collapse-down')
            }).on('hide.bs.collapse', function(){
                $(this).parent().children('button').children('span').removeClass("glyphicon-collapse-down").addClass('glyphicon-expand')
            });

    if(projectTreeNode.urlsafe != 'root')
    {
        childList.addClass('collapse');
    }

    if(projectTreeNode.children.length > 0)
    {
        for(var i=0; i < projectTreeNode.children.length; i++)
        {
            var childObject = GetSortedProjectList(projectTreeNode.children[i]);
            childList.append(childObject);
        }

        projectItem.append(childList);
    }

    return projectItem;
}

function ArePrereqsComplete(courseKey, preReqList)
{
    if(preReqList.length > 0)
    {
        for(var i = 0; i < window.AppData.UserInfo.courses.length; i++)
        {
            if(window.AppData.UserInfo.courses[i].courseKey == courseKey)
            {
                var complete = false;
                for(var j = 0; j < preReqList.length; j++)
                {
                    if(window.AppData.UserInfo.courses[i].SubmittedProjects.hasOwnProperty(preReqList[j]))
                    {
                        for(var subIndex = 0; subIndex < window.AppData.UserInfo.courses[i].SubmittedProjects[preReqList[j]].length; subIndex++)
                        {
                            if(window.AppData.UserInfo.courses[i].SubmittedProjects[preReqList[j]][subIndex].Status == 'Complete')
                            {
                                complete = true;
                                break;
                            }
                            else
                            {
                                complete = false;
                            }
                        }
                    }
                    else
                    {
                        complete = false;
                        break;
                    }
                }
                return complete
            }
        }
    }
    return true;
}

function GetProjectByKey(courseKey, projectKey)
{
    for(var i = 0; i < window.AppData.UserInfo.courses.length; i++)
    {
        if(window.AppData.UserInfo.courses[i].courseKey == courseKey)
        {
            for(var j = 0; j < window.AppData.UserInfo.courses[i].courseInfo.projects.length; j++)
            {
                if(window.AppData.UserInfo.courses[i].courseInfo.projects[j].urlsafe == projectKey)
                {
                    return window.AppData.UserInfo.courses[i].courseInfo.projects[j];
                }
            }
            break;
        }
    }
    return null;
}

function GetMostRecentSubmission(submissionList)
{
    if(submissionList == null)
    {
        return null;
    }
    var mostRecentSubmission = null;
    for(var subIndex = 0; subIndex < submissionList.length; subIndex++)
    {
        if(mostRecentSubmission == null)
        {
            mostRecentSubmission = submissionList[subIndex];
            continue;
        }
        if(submissionList[subIndex].LastModifiedDate == null || submissionList[subIndex].LastModifiedDate > mostRecentSubmission.LastModifiedDate)
        {
            mostRecentSubmission = submissionList[subIndex];
        }
    }
    return mostRecentSubmission
}

function GetProjectDisplay(projectNode)
{
    var thumbnail = $('<div/>', {style:'max-width: 450px;margin-left: auto;margin-right: auto;'}).addClass('thumbnail');
    var icon = $('<img/>', {src:"/images/missing.png", style:"width:50%"}).addClass("img-responsive img-circle");
    var caption = $('<div/>', {style:'max-width:400px; white-space:normal'}).addClass('caption text-left');
    caption.append($('<h3/>', {style:'word-wrap: break-word'}).text(projectNode.data.projectName));
    caption.append($('<p/>', {style:'word-wrap: break-word'}).text(projectNode.data.description));
    caption.append($('<button/>').text("Project Key").addClass('btn btn-xs btn-info').click(projectNode.urlsafe, function(click){
        window.prompt("Copy to clipboard: Ctrl+C, Enter", click.data);
    }));

    caption.append($('<p/>').text("Level: "+projectNode.data.level + "  XP:"+projectNode.data.projectXP));
    caption.append($('<p/>').text("Challenge: "+projectNode.data.ChallengeLevel));

    if(projectNode.data.videoURL && projectNode.data.videoURL != "")
    {
        var embedSRC = '//www.youtube.com/embed/'+getYoutubeId(projectNode.data.videoURL);
        icon =$('<iframe/>', {src:embedSRC,frameBorder:'0', style:"margin-left:auto; margin-right:auto"}).prop('allowfullscreen', true).attr('width','400').attr('height', '225');
    }

    if(projectNode.data.prerequisiteProjectIDs.length > 0)
    {
        var preReqList = $('<ul/>', {style:'max-width:400px; overflow-x:auto;'});
        for(var index =0; index < projectNode.data.prerequisiteProjectIDs.length; index++)
        {
            var reqProject = GetProjectByKey(projectNode.data.courseKey, projectNode.data.prerequisiteProjectIDs[index]);
            preReqList.append($('<li/>').append($('<button/>').addClass('btn btn-default').text(reqProject.projectName).click(reqProject.urlsafe,function(event){

                $("#"+event.data).children('button').trigger('click');
            })));
        }
        caption.append('<h4>PreReqs</h4>');
        caption.append(preReqList);
    }

    if(projectNode.data.attachments.length > 0)
    {
        var AttachmentList = $('<ul/>', {style:'max-width:400px; margin-left:10px'});
        for(var i =0; i < projectNode.data.attachments.length; i++)
        {
            AttachmentList.append($('<li/>').append($('<a/>', {href:projectNode.data.attachments[i]}).text(projectNode.data.attachments[i])));
        }
        caption.append('<h4>Attachments</h4>');
        caption.append(AttachmentList);
    }

    if(projectNode.data.requirements.length > 0)
    {
        var requirementsList = $('<ol/>', {style:'max-width:400px;  margin-left:10px'});
        for(var j =0; j < projectNode.data.requirements.length; j++)
        {
            requirementsList.append($('<li/>').text(projectNode.data.requirements[j]));
        }
        caption.append('<h4>Requirements</h4>');
        caption.append(requirementsList);
    }

    var projectButtonContainer = $('<div/>', {style:'max-width:400px'}).addClass('btn-group btn-group-justified');

    if(projectNode.submission != null)
    {
        var mostRecentSubmission = GetMostRecentSubmission(projectNode.submission);
        switch(mostRecentSubmission.Status)
        {
            case "UnderReview":
                var reviewBTN = $('<div/>').addClass('btn-group').append(
                    $('<button/>').addClass('btn btn-warning').text("UnderReview ").append('<span class="glyphicon glyphicon-eye-open"></span>').prop('disabled', true)
                );
                projectButtonContainer.append(reviewBTN);
                break;
            case 'Complete':
                var completeBtn = $('<div/>').addClass('btn-group').append(
                    $('<button/>').addClass('btn btn-success').text("Complete ").append('<span class="glyphicon glyphicon-star"></span>').prop('disabled', true)
                );
                projectButtonContainer.append(completeBtn);
                break;
            case 'InProgress':
                var inProgressBtn = $('<div/>').addClass('btn-group').append(
                    $('<button/>').addClass('btn btn-success').text("Inprogress ").append('<span class="glyphicon glyphicon-time"></span>').prop('disabled', true)
                );
                var progressSubmitButton = $('<div/>').addClass('btn-group').append(
                    $('<button/>').addClass('btn btn-success').text("Submit ").append('<span class="glyphicon glyphicon-ok-sign"></span>').click(projectNode, function(event){
                        var newSubmission = {};
                        jQuery.extend(newSubmission,window.AppData.defaults.characterProject);
                        DisplayGenericEditor(newSubmission, 'Submit Project:'+event.data.data.projectName, APICalls.SubmitProject, {
                            CharacterID:window.AppData.UserInfo.character.urlsafe,
                            ProjectID:event.data.data.urlsafe,
                            CourseID:event.data.data.courseKey,
                            Status:"UnderReview"
                        }, {
                            disableAllExcept:true,
                            fields:['SubmissionLinks']
                        });
                    })
                );
                projectButtonContainer.append(inProgressBtn);
                projectButtonContainer.append(progressSubmitButton);
                break;
            case 'Rejected':
                var rejectBTN = $('<div/>').addClass('btn-group').append(
                    $('<button/>').addClass('btn btn-danger').text("Rejected ").append('<span class="glyphicon glyphicon-remove"></span>').prop('disabled', true)
                );
                projectButtonContainer.append(rejectBTN);
                var rejectSubmitButton = $('<div/>').addClass('btn-group').append(
                    $('<button/>').addClass('btn btn-success').text("Submit ").append('<span class="glyphicon glyphicon-ok-sign"></span>').click(projectNode, function(event){
                        var newSubmission = {};
                        jQuery.extend(newSubmission,window.AppData.defaults.characterProject);
                        newSubmission.CharacterID = window.AppData.UserInfo.character.urlsafe;
                        newSubmission.ProjectID = event.data.data.urlsafe;
                        newSubmission.CourseID = event.data.data.courseKey;
                        APICalls.StartProject(newSubmission);
                        DisplayGenericEditor(newSubmission, 'Submit Project:'+event.data.data.projectName, APICalls.SubmitProject, {
                            CharacterID:window.AppData.UserInfo.character.urlsafe,
                            ProjectID:event.data.data.urlsafe,
                            CourseID:event.data.data.courseKey,
                            Status:"UnderReview"
                        }, {
                            disableAllExcept:true,
                            fields:['SubmissionLinks']
                        });
                    })
                );
                projectButtonContainer.append(rejectSubmitButton);
                break;
            default:
                break;
        }
    }
    else
    {
        if(ArePrereqsComplete(projectNode.data.courseKey, projectNode.data.prerequisiteProjectIDs))
        {
            var ProgressBtn = $('<div/>').addClass('btn-group').append(
                $('<button/>').addClass('btn btn-warning').text("InProgress ").append('<span class="glyphicon glyphicon-time"></span>').click(projectNode, function(event){
                    var newSubmission = {};
                    jQuery.extend(newSubmission,window.AppData.defaults.characterProject);
                    newSubmission.CharacterID = window.AppData.UserInfo.character.urlsafe;
                    newSubmission.ProjectID = event.data.data.urlsafe;
                    newSubmission.CourseID = event.data.data.courseKey;
                    projectNode.submission = [newSubmission];
                    APICalls.StartProject(newSubmission);

                })
            );
            projectButtonContainer.append(ProgressBtn);

            var SubmitButton = $('<div/>').addClass('btn-group').append(
                $('<button/>').addClass('btn btn-success').text("Submit ").append('<span class="glyphicon glyphicon-ok-sign"></span>').click(projectNode, function(event){
                    var newSubmission = {};
                    jQuery.extend(newSubmission,window.AppData.defaults.characterProject);
                    newSubmission.CharacterID = window.AppData.UserInfo.character.urlsafe;
                    newSubmission.ProjectID = event.data.data.urlsafe;
                    newSubmission.CourseID = event.data.data.courseKey;
                    APICalls.StartProject(newSubmission);
                    DisplayGenericEditor(newSubmission, 'Submit Project:'+event.data.data.projectName, APICalls.SubmitProject, {
                        CharacterID:window.AppData.UserInfo.character.urlsafe,
                        ProjectID:event.data.data.urlsafe,
                        CourseID:event.data.data.courseKey,
                        Status:"UnderReview"
                    }, {
                        disableAllExcept:true,
                        fields:['SubmissionLinks']
                    });
                })
            );
            projectButtonContainer.append(SubmitButton);
        }
    }
    caption.append(projectButtonContainer);

    thumbnail.append(icon);

    var DeleteBTN = $('<button/>').text("Delete").addClass('btn btn-xs btn-danger pull-right').append('<span class="glyphicon glyphicon-remove"></span>').click(projectNode.data, function(click){
            APICalls.DeleteProject(click.data.urlsafe);
            var index = GetCourseIndexByKey(click.data.courseKey);
            var parentAndIndex = FindParentProjectInTree(window.AppData.UserInfo.courses[index].courseInfo.SortedProjects, click.data.urlsafe);
            delete parentAndIndex.node.children[parentAndIndex.childIndex];
            if(window.AppData.SelectedProject)
            {
                $("#"+window.AppData.SelectedProject.urlsafe).children('button').removeClass("active");
            }
            window.AppData.SelectedProject = null;
        });

    if(projectNode.data.owningCharacter == window.AppData.UserInfo.character.urlsafe && projectNode.children.length == 0)
    {
        thumbnail.append(DeleteBTN);
    }

    if(window.AppData.UserInfo.character.isAdmin || projectNode.data.owningCharacter == window.AppData.UserInfo.character.urlsafe)
    {
        thumbnail.append($('<button/>').text("Edit").addClass('btn btn-xs btn-warning pull-right').append('<span class="glyphicon glyphicon-pencil"></span>').click(projectNode.data, function(click){
            DisplayGenericEditor(click.data, "Edit Project", function(updatedProject){
                APICalls.UpdateProject(updatedProject);
                DisplayCoursePage(updatedProject.courseKey);
                $("#"+updatedProject.urlsafe).children('button').trigger('click');
            });

        }));
    }
    thumbnail.append(caption);

    return thumbnail;
}

function AddSubmittedProject(newSubmission)
{
    for(var i = 0; i < window.AppData.UserInfo.courses.length; i++)
    {
        if(window.AppData.UserInfo.courses[i].courseKey == newSubmission.CourseID)
        {
            break;
        }
    }
    if(window.AppData.UserInfo.courses[i].SubmittedProjects[newSubmission.ProjectID])
    {
        for(var j = 0; j < window.AppData.UserInfo.courses[i].SubmittedProjects[newSubmission.ProjectID].length; j++)
        {
            if(window.AppData.UserInfo.courses[i].SubmittedProjects[newSubmission.ProjectID][j].Status == "InProgress" && newSubmission.Status == "UnderReview")
            {
                window.AppData.UserInfo.courses[i].SubmittedProjects[newSubmission.ProjectID][j] = newSubmission;
                return;
            }
        }
        window.AppData.UserInfo.courses[i].SubmittedProjects[newSubmission.ProjectID].push(newSubmission);
    }
    else
    {
        window.AppData.UserInfo.courses[i].SubmittedProjects[newSubmission.ProjectID] = [newSubmission];
    }

}

function SortProjects(allProjects, submittedProjects)
{

    var treeLookup = {};
    var projectTree = {urlsafe:'root', data:{}, children:[]};
    var waitingForParents = [];
    for(var i = 0; i < allProjects.length; i++)
    {
        var projObject = {urlsafe:allProjects[i].urlsafe, data:allProjects[i], submission: null, children:[]};

        treeLookup[allProjects[i].urlsafe] = projObject;

        if($.inArray(allProjects[i].urlsafe, submittedProjects.keys))
        {
            projObject.submission = submittedProjects[allProjects[i].urlsafe];
        }

        if(allProjects[i].prerequisiteProjectIDs.length == 1)
        {
            if(allProjects[i].prerequisiteProjectIDs[0] in treeLookup)
            {
                treeLookup[allProjects[i].prerequisiteProjectIDs[0]].children.push(projObject)
            }
            else
            {
                waitingForParents.push(projObject);
            }
        }
        else
        {
            projectTree.children.push(projObject);
        }
    }
    var removedChild = true;
    while(waitingForParents != null && waitingForParents.length > 0 && removedChild)
    {
        removedChild = false;
        for(var waitingIndex = 0; waitingIndex < waitingForParents.length; waitingIndex++)
        {
            if(waitingForParents[waitingIndex].data.prerequisiteProjectIDs[0] in treeLookup)
            {
                treeLookup[waitingForParents[waitingIndex].data.prerequisiteProjectIDs[0]].children.push(waitingForParents[waitingIndex]);
                waitingForParents.splice(waitingIndex,1);
                removedChild = true;
            }
        }
    }
    return projectTree;
}

function DisplayGenericEditor(editObject, title, setApiMethod, prefillData, disableData)
{
    disableData = typeof disableData !== 'undefined' ? disableData : {};
    prefillData = typeof prefillData !== 'undefined' ? prefillData : {};

    $('#EditorHeader').text(title);
    var modelEditor = $('#ModalEditor');

    var editList = $('<ul/>', {class:"list-unstyled"});
    for (var propertyName in editObject)
    {
        if (editObject.hasOwnProperty(propertyName))
        {
            var newLI = $('<li/>');

            var disabled = $.inArray(propertyName, disableData.fields) != -1;
            disabled = disableData.hasOwnProperty('disableAllExcept') ? !disabled : disabled;

            if(prefillData != null && prefillData.hasOwnProperty(propertyName))
            {
                newLI.append(CreateDefaultValueEditor(propertyName, prefillData[propertyName], disabled));
            }
            else
            {
                newLI.append(CreateDefaultValueEditor(propertyName, editObject[propertyName], disabled));
            }

            editList.append(newLI);
        }
    }
    modelEditor.find('.modal-body').empty().append(editList);
    modelEditor.find('.btn-primary').off('click').show().click(function(){
        UpdateObject(editObject, modelEditor.find('.modal-body input'));
        setApiMethod(editObject);
        modelEditor.modal('hide');
    });

    modelEditor.modal({
        backdrop:'static',
        keyboard:false
    });
}

function CreateDefaultValueEditor(key, value, disabled)
{
    var editWrapper = $('<div/>');
    editWrapper.attr('name', key);

    switch (typeof value)
    {
        case 'object':
            if(value != null)
            {
                if(value instanceof Array)
                {
                    editWrapper.attr('type', 'array');
                    editWrapper.append(key);

                    var newList = $('<ol/>', {name:key + "_list"});
                    for(var index = 0; index < value.length; index++)
                    {
                        AddListItem(newList, index, key, value[index]);
                    }

                    var AddButton = $('<button/>', {
                        owningList:key + "_list",
                        text:"+",
                        class:'btn btn-xs btn-success'
                    }).click(function(){AddListItem(newList, newList.children().length, key, null)});

                    editWrapper.append(AddButton);
                    editWrapper.append(newList);
                }
                else
                {
                    editWrapper.attr('type', 'object');

                    for (var property in value)
                    {
                        if (value.hasOwnProperty(property))
                        {
                            //editWrapper.append(CreateDefaultValueEditor(property, value[property]))
                        }
                    }
                }
                break;
            }
        default :
            editWrapper.addClass('input-group');

            editWrapper.append($('<span/>', {
                class:'input-group-addon',
                text:key
            }));

            var inputValue = $('<input/>',{
                type:'text',
                class:'form-Control',
                placeholder:value == null ? "Unknown Type" : typeof value,
                value: value == null ? "" : value.toString(),
                key:key
            }).prop('disabled', disabled);

            editWrapper.append(inputValue);
            break;
    }

    return editWrapper;
}

function AddListItem(listObject, itemIndex, newItemKey, newItemValue)
{
    var newLI = $('<li/>');
    var removeButton = $('<button/>', {
        text:"-",
        class:'btn btn-xs btn-danger'
    }).click(function(){RemoveListItem(listObject, newLI)});

    newLI.append(removeButton);
    newLI.append(CreateDefaultValueEditor(newItemKey, newItemValue));

    listObject.append(newLI);
    //listObject.append($('<li/>').attr('itemIndex', itemIndex).append(CreateDefaultEditor(newItemKey, newItemValue)));
}

function RemoveListItem(listObject,item)
{
    try
    {
        item.remove();
        //listObject.find('li:eq('+targetIndex+')').remove();
    }
    catch (ex)
    {

    }
}

function UpdateObject(editObject, inputTags)
{
    inputTags.each(function(index){
        if(editObject[$(this).attr('key')] instanceof Array )
        {
            editObject[$(this).attr('key')] = [];
        }
    });

    //console.log(editObject);
    inputTags.each(function(index){
        if(editObject[$(this).attr('key')] instanceof Array )
        {
            editObject[$(this).attr('key')].push($(this).val())
        }
        else
        {
            editObject[$(this).attr('key')] = $(this).val();
        }
    });
    //console.log(editObject);
}

function DisplayEnrollClassEditor()
{
    $('#EditorHeader').text("Enroll In Classes");
    var modelEditor = $('#ModalEditor');

    modelEditor.find('.modal-body').empty().text("Loading Classes...");
    modelEditor.find('.btn-primary').off('click').show().click(function(){
        modelEditor.modal('hide');
        setInterval(new function(){location.reload();}, 2000);
        ToggleLoading(true);
    }).text("Refresh Page to View Enrolled Courses!");

    APICalls.GetAllCourses().then(function(allCourses){
        var courseList = $('<ul/>');

        modelEditor.find('.modal-body').empty().append(courseList);

        for(var i = 0; i < allCourses.length; i++)
        {
            if(allCourses[i].courseNumber == 'GUEST')
            {
                continue;
            }

            var urlsafe = allCourses[i].urlsafe;
            var enrollBTN = $('<button/>').text("Enroll").addClass('btn btn-info').click(urlsafe, function(key){
                modelEditor.find('.btn-primary').prop('disabled', true);
                var thisBTN = $(this);
                thisBTN.prop('disabled', true).text('Enrolled! Waiting For Approval');

                APICalls.EnrollInCourse(key.data).then(new function(){
                    modelEditor.find('.btn-primary').prop('disabled', false);
                    thisBTN.prop('disabled', true).text('Enrolled!').addClass('btn-success').removeClass('btn-info');
                });
            });
            for(var index in window.AppData.UserInfo.courses)
            {
                if (window.AppData.UserInfo.courses[index].courseKey == allCourses[i].urlsafe)
                {
                    enrollBTN.off('click').prop('disabled', true).text('Enrolled!').addClass('btn-success').removeClass('btn-info');
                    break;
                }
            }
            var newLI = $('<li/>').text(allCourses[i].Name + "(" + allCourses[i].courseNumber +")").append(enrollBTN);
            newLI.append($('<ul/>').append($('<li/>').append($('<a/>', {href:allCourses[i].syllabusLink}).text("syllabus"))));
            courseList.append(newLI);
        }
    });

    modelEditor.modal({
        backdrop:'static',
        keyboard:false
    });
}