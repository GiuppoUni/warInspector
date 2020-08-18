# import re
# newL=""
# with open("pop.csv","r") as f:
    
#     for l in f:
#         newL=re.sub('\[(.*?)\]', '', l)
#         break

# with open("pop2.csv","w") as f:
#     f.write(newL)
#     with open("pop.csv","r") as fr:
#         i=0
#         for line in fr:
#             if(i!=0):
#                 f.write(line)
#             i+=1
#     f.close()
    
import csv
# with open('terrorDots.csv', newline='') as csvfile,open('terrorDots-small.csv',"w", newline='') as newFile:
#  data = csv.DictReader(csvfile)
#  print("ID Department Name")
#  print("---------------------------------")
#  spamwriter = csv.writer(newFile, delimiter=',')
#  for row in data:
# #    print(row['fatalities'], row['location'])
#     if(int(row["fatalities"])> 0):
#         spamwriter.writerow(row)

with open('conflictSpace.csv',"r") as csvfile,open('./countriesAlpha3.csv',"r") as codesFile:
    lines1 = csvfile.readlines()
    lines2 = codesFile.readlines()
    
    for line1 in lines1:
        row1 = line1.split(",")
        for line2 in lines2:
            row2 = line2.split(",")
