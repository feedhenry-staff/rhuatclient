exports.get=get;
exports.set=set;
var def={
  "TEST_SERVER":"localhost:9999"
};

var dynamic={

};

function get(key){
  return typeof dynamic[key]!=="undefined"?dynamic[key]:typeof process.env[key]!=="undefined"?process.env[key]:def[key];
}
function set (key,val){
   dynamic[key]=val;
}
