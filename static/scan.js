var appScan = new Vue({
  el: '#app-scan',
  data: {
    scanCode: "",
    result: "",
    code: "",
    item: "",
    size: "",
    quantity: ""
  },
  methods: {
    callScanApi: function() {
      console.log("submit");
      console.log(this.scanCode);
      this.code = this.scanCode;
      if(this.scanCode !== "") {
        var self = this;
        $.get("/scan?code="+this.scanCode, function(data, status) {
          data = JSON.parse(data);
          self.result = data;
          self.item = data['brand_name'] + " " + data['name'];
          self.size = data['size'];
          console.log(data);
        });
      }
      this.quantity = 1;
      document.getElementById("quantity").focus();
      document.getElementById("quantity").select();
      this.scanCode = "";
    },
    submitItem: function() {
      document.getElementById("scanCode").focus();
    }
  }
})