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


with open("countriesSelect.txt","r") as f:
    l=""
    for r in f:
        l += r.replace("\n","")
    print(l)
    