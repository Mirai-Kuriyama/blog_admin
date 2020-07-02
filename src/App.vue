<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  created() {
    let flag = sessionStorage.getItem("flag")
    if(!flag) {
      localStorage.removeItem("tagNaveList")
    }
    window.addEventListener("beforeunload",this.unloadHandler)
    
  },
  methods:{
    unloadHandler(e) {
      sessionStorage.setItem("flag",1)
      e = e || window.event;
      if (e && this.$route.name == "aAdd") {
        e.returnValue = "关闭提示";
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload",this.unloadHandler)
  }
};
</script>

<style lang="less">
.size {
  width: 100%;
  height: 100%;
}
html,
body {
  .size;
  overflow: hidden;
  margin: 0;
  padding: 0;
  // ::-webkit-scrollbar {
  //   display: none;
  // }
}
#app {
  .size;
}


</style>
