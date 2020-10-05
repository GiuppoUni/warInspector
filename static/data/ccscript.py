# with open("cc.csv","r") as f:
#     l = f.readline()
#     nl = l.split("</option>")
#     for state in nl:
#         # print( state.partition(" ")[1] )
#         pre = state.replace("<option>","").partition(" ")[0]
#         ns = state.replace("<option>","").partition(" ")[-1]
#         with open("countriesAlpha3.csv","r") as ff:
#             found=False
#             for r in ff:
#                 # if(r.split(",")[-2]=="code3"):
#                 #     continue
#                 if(r.split(",")[-2] in ns):
#                     ns = "<option value=" +  r.split(",")[-1].replace("\n","").strip()+">"+ pre + " " + ns + "</option>" 
#                     print( ns )
#                     found=True
#             if not found:
#                 print(ns)

#             # print(ns)


# with open("countriesSelect.txt","r") as f:
#     l=""
#     for r in f:
#         l += r.replace("\n","")
#     print(l)
    

import csv

# with open("conflictsMerged2.csv","r") as f,open("conflictsMerged3.csv","w") as fo:
#     # myreader = csv.reader(f, delimiter=',')
#     for row in f:
#         columns = row.split(",")
#         isos = columns[-3].split(";")
#         lats =columns[-2].split(";")
#         lons =columns[-1].split(";")
#         if(len(isos)>1):
#             print(isos)
#             pre_row=row[0:row.find(isos[0])]
#             for country,lat,lon in zip(isos,lats,lons):
#                 final_row = pre_row +country+","+lat+","+lon+"\n"
#                 fo.write(str(final_row))
#         else:
#             fo.write(str(row))

# with open("conflictsMerged3.csv","r") as f:
#      for row in f:
#         columns = row.split(",")
#         isos = columns[-3].split(";")
#         if(len(isos)>1):
#             print(isos)
#         if(len(row.split(","))!=11):
#             print(row.split(","),len(row.split(",")))    




with open('./allInfo.csv',"r") as csvfile, open('./countriesAlpha3.csv',"r") as codesFile, open('./allInfo2.csv',"w") as finalFile:
    lines1 = csvfile.readlines()
    lines2 = codesFile.readlines()
#     countries=[]
    finalFile.write(lines1[0].replace("\n","")+",code3\n")

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
        # countries = row1[-1].split(";")
        # countries = [c.replace("\n","").strip() for c in countries]      
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
#         lats=[]
#         lons=[]
#         visited=[]
#         for line2 in lines2:
#             row2 = line2.split(",")
#             lat = row2[1] 
#             lon = row2[2]
#             iso=row2[4].replace("\n","").strip()
#             if (  iso in countries  and iso not in visited):
#                 visited.append(iso)
#                 lats.append(lat)
#                 lons.append(lon)
                
# #             name=row2[3].lower().strip()
            
# #         if(len(isos) != len(countries)):
# #             print(isos,countries,name)
# 

        country = row1[0]
        for row2 in lines2:
            row2 = row2.split(",")
            # print(row2[-2])
            if(country.lower().strip().replace("\n","")==row2[-2].lower().strip().replace("\n","")):
                print(country)
        # finalFile.write(line1)


# with open('./conflictsMerged2.csv',"r") as finalFile:    
#     rows = finalFile.readlines()
#     for row in rows:
#         if(len(row.split(","))!=11):
#             print(row)

#         if(len(row.split(",")[-1].split(";"))!=   len(row.split(",")[-3].split(";")) ):
#             print(row)
