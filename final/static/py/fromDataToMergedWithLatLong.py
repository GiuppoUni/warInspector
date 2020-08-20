import pandas as pd
import numpy as np
import csv
import re

def main():
    # df_tab=pd.read_csv("static/data/table_2010-2018.csv")
    # df_co = pd.read_csv("static/data/countries.csv")

    # pd.merge(df_tab,df_co)


        # out=open("static/data/table_2010-2018-clean.csv","w")
    # with open("static/data/table_2010-2018.csv","r") as file:
    #     for line in file:
    #         line=line.replace('"',"")
    #         if("," not in line):
    #             line=line.replace("\n","")
    #         out.write(line)            


    out = open("../data/merged1990.csv","w")
    original1 = open("../data/Trade-Register-1990-2019.csv","r")
    # suppliers=[]
    # recipients=[]
    regex = re.compile('[^a-zA-Z]')
    losts=[]
    for idx,line in enumerate(original1):
        # Header
        if (idx==0):
            out.write(line.replace("\n","")+","+"latS"+","+"longS"+","+"codeS"+
            ","+"latR"+","+"longR" +","+"codeR"+ "\n")
            continue

        l1=line.split(",")
        print("l1",idx,l1[0],l1[1])
        # if(l1[0] not in suppliers):
        #     suppliers.append(l1[0])

        # if(l1[1] not in recipients):
        #     recipients.append(l1[1])

        original2 = open("../data/countriesAlpha3.csv","r")
        latS=""
        longS=""
        codeS=""
        latR=""
        longR=""
        codeR=""
        foundS=False
        foundR=False
        for line2 in original2:
            
            l2=line2.split(",") 
            #print("l2",l2[-2],l2[1],l2[2])
            
            #Supplier
            sup=l1[0]
            sup=" ".join(sup.split() )
            sup=regex.sub("",sup)
            #Recipient
            rec=l1[1]
            rec=" ".join(rec.split() )
            rec=regex.sub("",rec)
            #Country name
            con=l2[-2].strip()
            con=" ".join(con.split() )
            con=regex.sub("",con)

            if(sup == con and not foundS): #trovato il nome del sup 
                latS=l2[1]
                longS=l2[2]
                codeS=l2[-1].strip()
                foundS=True
            if(rec == con and not foundR): #trovato il nome del rec
                latR=l2[1]
                longR=l2[2]
                codeR=l2[-1].strip()
                foundR=True
            if(foundR and foundS):
                break        
        original2.close()

        # if(not foundS):
        #     original2 = open("static/data/countriesAlpha3.csv","r")
        #     #Altro giro questa volta mi basta in anziche ==
        #     for line2 in original2:
        #         l2=line2.split(",")
        #         #Country name
        #         con=l2[-2].strip()
        #         con=" ".join(con.split() )
        #         con=regex.sub("",con) 
        #         if(con in sup and not foundS): #trovato il nome del sup 
        #             latS=l2[1]
        #             longS=l2[2]
        #             codeS=l2[-1].strip()
        #             foundS=True
        #     original2.close()

        # if(not foundR):
        #     original2 = open("static/data/countriesAlpha3.csv","r")
        #     #Altro giro questa volta mi basta in anziche ==
        #     for line2 in original2:
                
        #         l2=line2.split(",") 
        #         con=l2[-2].strip()
        #         con=" ".join(con.split() )
        #         con=regex.sub("",con)
        #         if(con in rec and not foundR): #trovato il nome del sup 
        #             latR=l2[1]
        #             longR=l2[2]
        #             codeR=l2[-1].strip()
        #             foundR=True
        #     original2.close()
            
        if( not foundS and l1[0] not in losts):
            losts.append(l1[0])
        if( not foundR and l1[1] not in losts):
            losts.append(l1[1])
            
        
        # Fixing missing commas
        #
        commas=line.count(",")
        if(commas < 8):
            print(line)
        mrgd_row=line.replace("\n","") +","+latS+","+longS+","+codeS+","+latR+","+longR+","+codeR+"\n"

        out.write(mrgd_row)
    # print("supplier",suppliers)
    # print("recipients",recipients)
    print("LOSTS: ",losts)
    original1.close()
    out.close()


main()