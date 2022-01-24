  //jshint esversion:6

 const express = require("express");
 const bodyParser = require("body-parser");

 const mongoose = require("mongoose");

 // const date = require(__dirname + "/date.js");

 //capitalization
 const _ =require("lodash");

 const app = express();
 app.set("view engine", "ejs");
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(express.static("public"));

 // const items = ["Buy Food", "Cook Food", "Eat Food"];
 // const workItems = [];

 // mongoose
 mongoose.connect("mongodb+srv://admin-puja:test123@cluster0.6qrl2.mongodb.net/todolistDB");

 const itemsSchema =
 {
  name: String,
 };

 const Item = mongoose.model("Item", itemsSchema);

 const item1 = new Item({
  name: "Welcome to your ToDoList !",
 });

 const item2 = new Item({
  name: "Hit the + button to add a new item ",
 });

 const item3 = new Item({
  name: "<-- Check the box to delete an item",
 });

 const defaultItems = [item1, item2, item3];

 const listSchema = {
  name: String,
  items: [itemsSchema],
 };

 const List = mongoose.model("List", listSchema);

 // Item.insertMany(defaultItems,function(err)
 // {
 // if(err)
 // {
 // console.log(err);
 //  }
 // else
 // {
 //  console.log("Succesfully Inserted deafult items");
 //  }
 // });

 app.get("/", function (req, res) {
  //const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    //NOT TO CREATE MULTIPLE ITEM AFTER REFRESHING PAGE
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else
         {
          console.log("Succesfully Inserted deafult items");
         }
      });
      res.redirect("/");
     } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
    //cosole.log(foundItems);
  });
 });

 app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });


  if  (listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName );
    });
  }

 });

 app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;

   if(listName === "Today"){
       Item.findByIdAndRemove(checkedItemId, function (err) {
         if (!err) {
           console.log("Succesfully deleted  checked Id ");
           res.redirect("/");
         }
       });
     }
     else
     {
               //FOR CUSTOM_LIST
      List.findOneAndUpdate({name: listName},{$pull:{items:{ _id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+ listName);
        }
      });
     }
 });

 app.get("/:customListNsme", function (req, res) {
 const customListNsme = _.capitalize(req.params.customListNsme);
  List.findOne({ name: customListNsme }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //console.log("Doesn't Exist!");
        //CREATE A NEW LIST
        const list = new List({
          name: customListNsme,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListNsme);
        }
        else
        {
        //console.log("exists!");
        //SHOW AN EXISTING LIST
          res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
   });
 });

 let port = process.env.PORT;
 if (port == null || port == "") {
   port = 3000;
 }


 app.listen(port, function ()
 {
    console.log("Server started succesfully");
 });
