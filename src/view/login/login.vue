<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit" :disabled="disabled"></login-form>
          <!-- <p class="login-tip">输入任意用户名和密码即可</p> -->
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  data() {
    return {
      disabled:false
    }
  },
  methods: {
    ...mapActions("user",[
      'handleLogin',
    ]),
    handleSubmit ({ username, password }) {
      this.disabled = true
      this.handleLogin({ username, password}).then(res => {
          if(res.msg == "ok") {
            this.$Message.success("登陆成功")
            setTimeout(()=>{
              this.$router.push({
                name: this.$config.homeName
              })
            },800)
          }else {
            this.disabled = false
          }
      }).catch(err=>{
        this.disabled = false
      })
    }
  }
}
</script>

<style>

</style>
