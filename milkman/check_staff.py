from staff.models import Staff
import json
print('count', Staff.objects.count())
print(json.dumps(list(Staff.objects.values()), default=str))