# NOTES

+ dx-react-core, dx-react-grid, dx-react-grid-material-ui ***must*** stick to version `1.5.1` for dynamic DataTypeProvider works correctly, else only one Provider works
+ http server needs config redirect/rewrite to make sure react-router works in `production` env.

# CHANGES

## v0.3.0 2018-11-13
+ [x] [增加] `销售明细`，从订单下部进入

## v0.2.0 2018-11-04

+ [x] [FIXED] correctly set min/max for `<TextField>`/`<Input>` (by using `inputProps` instead of `InputProps`)

+ [x] [ADD] add `createdBy`, `createdOn`, `committedBy`, `committedOn` to delivery-sheet

+ [x] [CHANGED] delivery-date in delivery-sheet-details no longer early than today (by add `min` attr to `<TextField>`)

+ [x] [改进] 合同支持显示`合同金额`和`实际金额`
+ [x] [增加] `生成发货单` -> `提交至库房` -> `生成出库单`流程
+ [x] [增加] `出库单`受理完成之后，更新对应`发货单`的出库时间


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
