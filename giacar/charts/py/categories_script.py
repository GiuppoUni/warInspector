import csv

weap_desc = []
weap_num = []

with open("../data/merged.csv", 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)

    for row in csv_reader:
        #print(row["Weapon description"])
        if row["Weapon description"] not in weap_desc:
            weap_desc.append(row["Weapon description"])
        
        #print(row["Designation num."])
        if row["Designation num."] not in weap_num:
            weap_num.append(row["Designation num."])
        

print("#"*30)
print(len(weap_desc))
#print(weap_desc)
print("#"*30)
print(len(weap_num))
#print(weap_num)

