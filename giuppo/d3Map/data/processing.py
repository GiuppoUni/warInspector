import pandas as pd
import numpy as np
import csv
import re

def main():
    # df_tab=pd.read_csv("./table_2010-2018.csv")
    # df_co = pd.read_csv("./countries.csv")

    # pd.merge(df_tab,df_co)


        # out=open("./table_2010-2018-clean.csv","w")
    # with open("./table_2010-2018.csv","r") as file:
    #     for line in file:
    #         line=line.replace('"',"")
    #         if("," not in line):
    #             line=line.replace("\n","")
    #         out.write(line)            


    out=open("merged.csv","w")
    original1 = open("./table_2010-2018-clean.csv","r")
    # suppliers=[]
    # recipients=[]
    losts=[]
    for idx,line in enumerate(original1):
        if (idx==0):
            continue 
        l1=line.split(",")
        print("l1",idx,l1[0],l1[1])
        # if(l1[0] not in suppliers):
        #     suppliers.append(l1[0])

        # if(l1[1] not in recipients):
        #     recipients.append(l1[1])

        original2 = open("./countries.txt","r")
        latS=""
        longS=""
        latR=""
        longR=""
        foundS=False
        foundR=False
        for line2 in original2:
            line2=re.sub("(\t)+","\t",line2)
            l2=line2.split("\t") 
            #print("l2",l2[-1],l2[1],l2[2])
            if(l1[0].strip() == l2[-1].strip() and not foundS): #trovato il nome del sup 
                latS=l2[1]
                longS=l2[2]
                foundS=True
            if(l1[1].strip() == l2[-1].strip() and not foundR): #trovato il nome del rec
                latR=l2[1]
                longR=l2[2]
                foundR=True
            if(foundR and foundS):
                break        
        original2.close()

        if(not foundS):
            original2 = open("./countries.txt","r")
            for line2 in original2:
                line2=re.sub("(\t)+","\t",line2)
                l2=line2.split("\t") 
                if(l2[-1].strip() in l1[0].strip() and not foundS): #trovato il nome del sup 
                    latS=l2[1]
                    longS=l2[2]
                    foundS=True
            original2.close()

        if(not foundR):
            original2 = open("./countries.txt","r")
            for line2 in original2:
                line2=re.sub("(\t)+","\t",line2)
                l2=line2.split("\t") 
                if(l2[-1].strip() in l1[1].strip() and not foundR): #trovato il nome del sup 
                    latR=l2[1]
                    longR=l2[2]
                    foundR=True
            original2.close()
            
        if( not foundS and l1[0] not in losts):
            losts.append(l1[0])
        if( not foundR and l1[1] not in losts):
            losts.append(l1[1])
            


        mrgd_row=line.strip()+","+latS+","+longS+","+latR+","+longR+"\n"

        out.write(mrgd_row)
    # print("supplier",suppliers)
    # print("recipients",recipients)
    print("losts: ",losts)
    original1.close()
    out.close()


main()