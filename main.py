#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
from google.appengine.api import users
import webapp2
from baseRequestHandler import BaseRequestHandler
from ndbEntityDefs import *
from APIHandler import ApiHandler


class MainHandler(BaseRequestHandler):

    def RenderSuccess(self):
        path = os.path.join(os.path.split(__file__)[0], 'templates/gamedevpanthers.html')
        with open(path, 'r') as contentFile:
            self.response.out.write(contentFile.read())
        return

    def RenderFailure(self):
        path = os.path.join(os.path.split(__file__)[0], 'templates/gamedevpanthers.html')
        with open(path, 'r') as contentFile:
            self.response.out.write(contentFile.read())
        return

app = webapp2.WSGIApplication(debug=True)
app.router.add(('/', MainHandler))
app.router.add(('/api/.*', ApiHandler))


app.error_handlers[404] = BaseRequestHandler.handle_404
