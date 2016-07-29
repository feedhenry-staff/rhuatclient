#!/usr/bin/env node
var comm=require("./comm");
var api=require("./api");
require("./appium").init(function(){
  comm.init(function(){
    require("./deviceAgent").init(function(){
    });
  });
})
