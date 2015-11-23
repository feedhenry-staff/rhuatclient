#!/usr/bin/env node
var comm=require("./comm");
var api=require("./api");
comm.init(function(){
  require("./deviceAgent").init(function(){
    require("./appium").init(function(){

    })
  });
});
