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
import re
# with open('terrorDots.csv', newline='') as csvfile,open('terrorDots-small.csv',"w", newline='') as newFile:
#  data = csv.DictReader(csvfile)
#  print("ID Department Name")
#  print("---------------------------------")
#  spamwriter = csv.writer(newFile, delimiter=',')
#  for row in data:
# #    print(row['fatalities'], row['location'])
#     if(int(row["fatalities"])> 0):
#         spamwriter.writerow(row)

# lines1=[]
# with open('./confictsSpace.csv',"r") as csvfile,open('./countriesAlpha3.csv',"r") as codesFile:
#     lines1 = csvfile.readlines()
#     lines2 = codesFile.readlines()
#     countries=[]
#     for idx,line1 in enumerate(lines1):
#         row1 = line1.split(",")
#         if (line1[0]==" "):
#             # countries.append(line1)
#             lines1[idx-1] = lines1[idx-1].replace("\n",";")

#     # for idx,line1 in enumerate(lines1):
    
#     #     row1 = line1.split(",")
#     #     countries = row1[4]
#     #     # # for line2 in lines2:
#     #     # #     row2 = line2.split(",")
#     #     print(countries)

# with open("./confictsNoSpace.csv","w") as ff:
#     ff.writelines(lines1)


# with open('./confictsNoSpace.csv',"r") as csvfile,open('./countriesAlpha3.csv',"r") as codesFile,open('./conflictsMerged.csv',"w") as finalFile:
#     lines1 = csvfile.readlines()
#     lines2 = codesFile.readlines()
#     countries=[]
#     for idx,line1 in enumerate(lines1):
#         if(idx<=1):
#             continue

#         row1 = line1.split(",")
#         if(int(row1[0]) <= 1989 ):
#             continue
#         # for idx,line1 in enumerate(lines1):
#         for i,column in enumerate(row1):
#             row1[i] = column.replace('"',"")
#         line1=",".join(row1)
#         # if(len(row1)<5):
#         #     print(row1)
#         countries = row1[4].split(";")
#         countriesOriginal = countries
#         for i,c in enumerate(countries):
#             countries[i] = c.lower().strip()
#             countries[i]=re.sub(r'[1-9]', '', countries[i])
#             if(countries[i]=="dem. rep. of congo"):
#                 countries[i]="congo"
#             if(countries[i]=="ivory coast"):
#                 countries[i]="cote d'ivoire"
#             if(countries[i]=="congo-brazzaville"):
#                 countries[i]="congo"
#             if(countries[i]=="central african rep."):
#                 countries[i]="central african republic"
#             if(countries[i]=="dem. rep. of congo (zaire)"):
#                 countries[i]="congo"
#             if(countries[i]=="zaire"):
#                 countries[i]="congo"
#             if(countries[i]=="bosnia"):
#                 countries[i]="bosnia-herzegovina"
#             if(countries[i]=="ussr"):
#                 countries[i]="russia"
#         # print(countries)
#         isos=[]
#         for line2 in lines2:
#             row2 = line2.split(",")
#             name=row2[3].lower().strip()
#             iso=row2[4]
#             if ( ("CAF\n"==iso and "central african republic" in countries) or name in countries ):
#                 if(iso.replace("\n","") not in isos):
#                     isos.append(iso.replace("\n",""))
            
#         if(len(isos) != len(countries)):
#             print(isos,countries,name)

#         line1 = line1.replace("\n","")
#         line1 +=","+";".join(isos)+"\n"
#         finalFile.write(line1)


# SANITY CHECK

with open('./conflictsMerged.csv',"r") as finalFile:    
    rows = finalFile.readlines()
    for row in rows:
        if(len(row.split(","))!=9):
            print(row)



with open('./conflictsMerged.csv',"r") as csvfile, open('./countriesAlpha3.csv',"r") as codesFile, open('./conflictsMerged2.csv',"w") as finalFile:
    lines1 = csvfile.readlines()
    lines2 = codesFile.readlines()
#     countries=[]
    finalFile.write(lines1[0].replace("\n","")+",lats,lons\n")

    for idx,line1 in enumerate(lines1):
        if(idx<=1):
            continue

        row1 = line1.split(",")
#         if(int(row1[0]) <= 1989 ):
#             continue
#         # for idx,line1 in enumerate(lines1):
#         for i,column in enumerate(row1):
#             row1[i] = column.replace('"',"")
#         line1=",".join(row1)
#         # if(len(row1)<5):
#         #     print(row1)
        countries = row1[-1].split(";")
        countries = [c.replace("\n","").strip() for c in countries]      
#   countriesOriginal = countries
        # for i,c in enumerate(countries):
#             countries[i] = c.lower().strip()
#             countries[i]=re.sub(r'[1-9]', '', countries[i])
#             if(countries[i]=="dem. rep. of congo"):
#                 countries[i]="congo"
#             if(countries[i]=="ivory coast"):
#                 countries[i]="cote d'ivoire"
#             if(countries[i]=="congo-brazzaville"):
#                 countries[i]="congo"
#             if(countries[i]=="central african rep."):
#                 countries[i]="central african republic"
#             if(countries[i]=="dem. rep. of congo (zaire)"):
#                 countries[i]="congo"
#             if(countries[i]=="zaire"):
#                 countries[i]="congo"
#             if(countries[i]=="bosnia"):
#                 countries[i]="bosnia-herzegovina"
#             if(countries[i]=="ussr"):
#                 countries[i]="russia"
#         # print(countries)
        lats=[]
        lons=[]
        visited=[]
        for line2 in lines2:
            row2 = line2.split(",")
            lat = row2[1] 
            lon = row2[2]
            iso=row2[4].replace("\n","").strip()
            if (  iso in countries  and iso not in visited):
                visited.append(iso)
                lats.append(lat)
                lons.append(lon)
                
#             name=row2[3].lower().strip()
            
#         if(len(isos) != len(countries)):
#             print(isos,countries,name)
# 
        line1 = line1.replace("\n","")
        line1 +=","+";".join(lats)+","+";".join(lons) +"\n"

        finalFile.write(line1)


with open('./conflictsMerged2.csv',"r") as finalFile:    
    rows = finalFile.readlines()
    for row in rows:
        if(len(row.split(","))!=11):
            print(row)

        if(len(row.split(",")[-1].split(";"))!=   len(row.split(",")[-3].split(";")) ):
            print(row)