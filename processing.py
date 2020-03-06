
import csv

PATH="./data/"

#flags


CRED = '\033[91m'
CEND = '\033[0m'


def main():
    STARTED=False

       
    # Writing header on csv                
    csv_file= open(PATH+"table_2010-2018.csv","w")
    writer = csv.writer(csv_file)
    writer.writerow([ "supplier","recipient","ordered","designation_num",	
        "weapon_description",	"delivery_year",	"delivered_num",	"comments"])
    
    out_file = open(PATH+"trade_out_2010-2018.txt","w") 
    with open(PATH + "Trade-Register-2010-2018.rtf","r") as file:
        supplier=""
        recipient=""
        for line in file:
            
            #print(line)
            
            if("generated" in line and not STARTED):
                continue
            else:
                STARTED=True

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

                out_file.write(supplier+ '\t' +old_line)
    out_file.close()
    csv_file.close()
def printC(str):
    print(CRED + str + CEND)



main()
