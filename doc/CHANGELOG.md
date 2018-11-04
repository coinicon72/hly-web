# NOTES

+ dx-react-core, dx-react-grid, dx-react-grid-material-ui ***must*** stick to version ```1.5.1``` for dynamic DataTypeProvider works correctly, else only one Provider works
+ http server needs config redirect/rewrite to make sure react-router works in ```production``` env.

# CHANGES

## v0.2.0 2018-11-04

+ [x] [FIXED] correctly set min/max for ```<TextField>```/```<Input>``` (by using ```inputProps``` instead of ```InputProps```)

+ [x] [ADD] add ```createdBy```, ```createdOn```, ```committedBy```, ```committedOn``` to delivery-sheet
+ [x] [ADD] can commit delivery-sheet to repo
+ [ ] [ADD] add ```process delivery sheet``` to repo managment, repo-keeper can create ```repo-change-sheet``` from committed ```delivery-sheet```

+ [x] [CHANGED] delivery-date in delivery-sheet-details no longer early than today (by add ```min``` attr to ```<TextField>```)


## 2018-08-29

### sales details

### purching details


## 2018-08-24

### repo changing

+ items selection related with repo type, means only shows materials for material repo, only shows products for product repo

### delivery sheet

+ create delivery sheet from order page
+ edit delivery sheet
+ view delivery sheets from order page
+ show all delivery sheets
