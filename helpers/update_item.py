# -*- coding: utf-8 -*-
import pysb
import os, time
from datetime import datetime

photo_parent_id = "599f87c6e4b038630d00ff7f"

sb = pysb.SbSession()
# Get a private item.  Need to log in first.
sb.login('jsherba@usgs.gov', 'CamelliaBloom0601@')




test_item = sb.get_item('597e93f5e4b0a38ca2774a35')
test_item['body']="testtest"
print(test_item)
sb.update_item(test_item)

