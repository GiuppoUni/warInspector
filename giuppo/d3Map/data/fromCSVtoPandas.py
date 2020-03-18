import pandas as pd 
from iso3166 import countries
# Read data from file 'filename.csv' 
# (in the same directory that your python process is based)
# Control delimiters, rows, column names with read_csv (see later) 
data = pd.read_csv("merged.csv") 
# Preview the first 5 lines of the loaded data 
print(data.head())


grouped=data.groupby("Supplier")["Recipient"].value_counts()
print(grouped.loc[grouped["Recipient"]=="United States"])


# CREATING OTHER COUNTRIES CSV

# #grouped.to_csv("grouped.csv")

# fout=open("countriesAlpha3.csv","w")
# with open("countries.csv","r") as file:
#     for idx,line in enumerate(file):
#         code=line.split(",")[0]
        
#         if(idx==0):
#             code3="code3"
#         elif(code=="ZZ" ):
#             code3="ZZZ"
#         elif(code=="GZ"):
#             code3="GZE"
#         elif(code=="AN"):
#             code3="ANN"
#         else:

#             code3=countries.get(code)[2]

#         print(code3 )
#         fout.write(line.replace("\n","") + "," + code3+"\n")


# fout.close()