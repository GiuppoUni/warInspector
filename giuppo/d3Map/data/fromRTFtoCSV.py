
import csv
import os
import string

PATH="./"
RTF_FILE="Trade-Register-2010-2018.rtf"
#flags


CRED = '\033[91m'
CEND = '\033[0m'


def main():
    STARTED=False

    print("Starting opening:",PATH,RTF_FILE)
    #if(RTF_FILE[:-4]+".txt" not in os.listdir(PATH)):
    
    createTxt()
    createCsv()
   

def printC(str):
    print(CRED + str + CEND)

def createTxt():
    print("Creating txt...")
    out_file = open(PATH + RTF_FILE[:-4] + ".txt","w") 

    file = open(PATH + RTF_FILE ,"r") 
    for line in file:
        #To skip until "generated" word
        if("generated" in line and not STARTED):
            continue
        else:
            STARTED=True
        
        line=line.replace(",","")
        line=line.replace("}","\n")
        line=line.replace("\\tab",", ")
        if(line[0]!=" " and "{\\b" not in line[0:7] ):
            continue
        
        # if("}" in line ):
        #     line=line[3:]
        #     print("{")

        #line=" ".join( [x for x in line.split(" ") if (is_ascii(x) or x=="\\b") ] )
        
        
        out_file.write(line)
    file.close()
    out_file.close()

    print("Creating txt2...")
    out2_file = open(PATH + RTF_FILE[:-4]+"_MOD" + ".txt","w") 

    with open(PATH + RTF_FILE[:-4]+".txt" ,"r") as file2:
        for idx,line in enumerate(file2):
            #if(idx>5): break
            
            if("\\"  in line[0]):
                continue
            if("\\b" in line[0:5] ):
                line=line[4:]
            if(" "==line[0]):
                line=line.split("\\par")[0] + "\n"            
                line=line.replace(";"," |")
                line=line.replace("'","")
            
            #line=" ".join( [x for x in line.split(" ") if (is_ascii(x) or x=="\\b") ] )
            
            
            out2_file.write(line)
        out2_file.close()


def createCsv():
    print("Creating csv...")

 # Writing header on csv                
    csv_file= open(PATH + RTF_FILE[:-4] + ".csv","w")
    writer = csv.writer(csv_file)
    writer.writerow([ "Supplier","Recipient","Ordered","Designation num.",	
        "Weapon description",	"Ordered year","Delivery year",	"Delivered num.",	"Comments"])
    
    
    with open(PATH + RTF_FILE[:-4] + "_MOD.txt","r") as file:
        supplier=""
        recipient=""
        for idx,line in enumerate(file):
            
           # if(idx>30): break
           
            row=""
            if(line[0]!=" " ):
                supplier=line
                continue
            else:
                splitted=line.split(",")
                if(splitted[0].isspace() and splitted[1].isspace()):
                    splitted=[x for i,x in enumerate(splitted) if i!=0 ]

                if(not line.partition(",")[0].isspace()):
                    recipient=line.partition(",")[0]
                row =  [supplier.replace("\n","")] + [' '.join(x.split()) for x in splitted] 
                
            

            c=",".join(row).count(",")
            if(c!=8 ):
                #printC(str(c))
                row=[x for i,x in enumerate(row) if i==0 or x != row[i-1] or i!=2 or i!=1 ]
                row[1] = ' '.join(recipient.split())
                #print(row)
            elif( c == 8 and row[1].isspace() or row[1]==""):
                row[1]=  ' '.join(recipient.split())
            #Checks
            if(row[4].isdigit()):
                printC(row[4])
                print(row)   
                 

            writer.writerow( row )
            
                
    csv_file.close()

####
# OLD VERSION
# ####
# def createCsv():
#     print("Creating csv...")

#  # Writing header on csv                
#     csv_file= open(PATH + RTF_FILE[:-4] + ".csv","w")
#     writer = csv.writer(csv_file)
#     writer.writerow([ "Supplier","Recipient","Ordered","Designation num.",	
#         "Weapon description",	"Delivery year",	"Delivered num.",	"Comments"])
    
    
#     with open(PATH + RTF_FILE[:-4] + ".txt","r") as file:
#         supplier=""
#         recipient=""
#         for line in file:
            
#             #print(line)

#             old_line=line
            
                         
#             ordered=""
#             designation_num=""	
#             weapon_description=""	
#             delivery_year=""	
#             delivered_num=""	
#             comments=""

#             if("{\\b" in line[0:4]):
#                 supplier=line.partition("\\b")[2].replace("}","") 
#                 printC(supplier)
            
            
#             if(line[0]==" "):

#                 if( not line.partition("\\tab")[0].isspace() ):
#                     recipient=line.partition("\\tab")[0]

#                 # print(line.partition("\\tab")[0],line.partition("\\tab")[0].isspace())                    
#                 #print(line.partition("\\tab")[0])
                
#                 #Burning upper part of line
#                 line=line.partition("\\tab")[2]

#                 ordered = line.partition("\\tab")[0] 
                
#                 #Burning upper part of line
#                 line=line.partition("\\tab")[2]

#                 designation_num= line.partition("\\tab")[0] 

#                 #Burning upper part of line
#                 line=line.partition("\\tab")[2]

#                 weapon_description= line.partition("\\tab")[0] 

#                 #Burning upper part of line
#                 line=line.partition("\\tab")[2]

#                 weapon_of_order= line.partition("\\tab")[0] 

#                 #Burning upper part of line
#                 line=line.partition("\\tab")[2]

#                 delivery_year= line.partition("\\tab")[0] 

#                 #Burning upper part of line
#                 line=line.partition("\\tab")[2]

#                 delivered_num= line.partition("\\tab")[0] 


#                 #Burning upper part of line
#                 line=line.partition("\\tab")[2]

#                 #Polishing
#                 comments= line.partition("\\tab")[0] 
#                 comments=comments.partition("\\par")[0]
#                 comments=comments.replace(";"," | ")
            

#                 writer.writerow([ supplier,recipient,ordered,designation_num,
#                 weapon_description,	delivery_year,	delivered_num,	comments])


#     csv_file.close()


def createRTF():
    print("Creating rtf...")
    out_file = open(PATH + RTF_FILE[:-4] +"CLEAN"+ ".rtf","w") 

    with open(PATH + RTF_FILE ,"r") as file:
        for line in file:
            #To skip until "generated" word
            if("generated" in line and not STARTED):
                continue
            else:
                STARTED=True
            line=line.replace(","," ")
            out_file.write(line)

    out_file.close()



###
# 
# 
###
    
main()
