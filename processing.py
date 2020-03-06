
import csv
import os

PATH="./data/"
RTF_FILE="Trade-Register-2010-2018.rtf"
#flags


CRED = '\033[91m'
CEND = '\033[0m'


def main():
    STARTED=False

    print("Starting opening:",PATH,RTF_FILE)
    if(RTF_FILE[:-4]+".txt" not in os.listdir(PATH)):
        createTxt()
       
    # Writing header on csv                
    csv_file= open(PATH + RTF_FILE[:-4] + ".csv","w")
    writer = csv.writer(csv_file)
    writer.writerow([ "Supplier","Recipient","Ordered","Designation num.",	
        "Weapon description",	"Delivery year",	"Delivered num.",	"Comments"])
    
    
    with open(PATH + RTF_FILE[:-4] + ".txt","r") as file:
        supplier=""
        recipient=""
        for line in file:
            
            #print(line)

            old_line=line
            
                         
            ordered=""
            designation_num=""	
            weapon_description=""	
            delivery_year=""	
            delivered_num=""	
            comments=""

            if("{\\b" in line[0:4]):
                supplier=line.partition("\\b")[2].replace("}","") 
                printC(supplier)
            
            
            if(line[0]==" "):

                if( not line.partition("\\tab")[0].isspace() ):
                    recipient=line.partition("\\tab")[0]

                # print(line.partition("\\tab")[0],line.partition("\\tab")[0].isspace())                    
                #print(line.partition("\\tab")[0])
                
                #Burning upper part of line
                line=line.partition("\\tab")[2]

                ordered = line.partition("\\tab")[0] 
                
                #Burning upper part of line
                line=line.partition("\\tab")[2]

                designation_num= line.partition("\\tab")[0] 

                #Burning upper part of line
                line=line.partition("\\tab")[2]

                weapon_description= line.partition("\\tab")[0] 

                #Burning upper part of line
                line=line.partition("\\tab")[2]

                weapon_of_order= line.partition("\\tab")[0] 

                #Burning upper part of line
                line=line.partition("\\tab")[2]

                delivery_year= line.partition("\\tab")[0] 

                #Burning upper part of line
                line=line.partition("\\tab")[2]

                delivered_num= line.partition("\\tab")[0] 


                #Burning upper part of line
                line=line.partition("\\tab")[2]

                #Polishing
                comments= line.partition("\\tab")[0] 
                comments=comments.partition("\\par")[0]
                comments=comments.replace(";"," | ")
            

                writer.writerow([ supplier,recipient,ordered,designation_num,
                weapon_description,	delivery_year,	delivered_num,	comments])


    csv_file.close()

def printC(str):
    print(CRED + str + CEND)

def createTxt():
    print("Creating txt...")
    out_file = open(PATH + RTF_FILE[:-4] + ".txt","w") 

    with open(PATH + "Trade-Register-2010-2018.rtf","r") as file:
        for line in file:
            if("generated" in line and not STARTED):
                continue
            else:
                STARTED=True

            line=line.replace("}","}\n")
            out_file.write(line)

    out_file.close()


main()
