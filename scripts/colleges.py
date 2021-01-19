import csv
import json

with open('colleges.csv') as infile:
    reader = csv.DictReader(infile)
    out = [{"name": row['College Name'], "city": row["City"]
            } for row in reader if (row['City'] == 'Mumbai' or row['City'] == 'Pune')]

with open('data_oecd.json', 'w') as outfile:
    json.dump(out, outfile)
