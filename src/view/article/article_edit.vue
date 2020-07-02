<template>
  <div class="article-add">
    <Form :model="formTop" label-position="top" ref="formValidate" :rules="ruleValidate">
      <FormItem label="标题" prop="title">
        <Input v-model="formTop.title" />
      </FormItem>

      <FormItem label="简介" prop="desc">
        <Input
          v-model="formTop.desc"
          type="textarea"
          maxlength="150"
          show-word-limit
          :rows="4"
          placeholder="文章简介"
        />
      </FormItem>
      <FormItem label="分类" prop="category_id">
        <RadioGroup v-model="formTop.category_id" type="button" size="large">
          <Radio
            style="margin:8px 10px 0 0"
            :label="item.id"
            v-for="(item) in cat_list"
            :key="item.id"
            border
          >{{item.text}}</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="封面图" prop="cover_url">
        <div v-if="!formTop.cover_url">
          <Upload
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-success="handleSuccess"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            :data="{authorization:'ht '+ $store.state.user.user_info.token}"
            :action="$config.baseUrl+'api/upload'"
          >
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>点击或将图片拖到此处</p>
            </div>
          </Upload>
        </div>
        <div v-else class="img-box" style>
          <div class="img-operate">
            <div class="operate-box">
              <div class="review" @click="handleCover('view')">
                <Icon type="md-images" size="50" />
                <div>预览</div>
              </div>
              <div class="delete" @click="handleCover('del')">
                <Icon type="md-close-circle" size="50" />
                <div>删除</div>
              </div>
            </div>
          </div>
          <img
            :src="$config.imgBaseUrl+formTop.cover_url"
            style="width:100%;height:100%; object-fit: contain;"
            alt
          />
        </div>
      </FormItem>

      <FormItem prop="content">
        <vue-xeditor :id="editorId" ref="editor" @mounted="editMount" v-model="formTop.content"></vue-xeditor>
      </FormItem>
      <FormItem label="过审后自动发布">
        <i-switch v-model="auto_pub" size="large">
          <span slot="open">自动</span>
          <span slot="close">手动</span>
        </i-switch>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSubmit(1)" :disabled="loading" :loading="loading" >提交审核</Button>
        <!-- <Button @click="handleSubmit(0)" style="margin-left: 8px">存为草稿</Button> -->
      </FormItem>
    </Form>

    <Modal title="图片预览" v-model="visible">
      <img v-if="formTop.cover_url" :src="$config.imgBaseUrl+formTop.cover_url" style="width: 100%" />
    </Modal>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "aAdd",
  data() {
    return {
      /* 富文本编辑器参数 */
      editorId: "editorAdd",
      loading:false,
      cat_list: [],
      /* 表单参数 */
      formTop: {
        title: "",
        desc: "",
        category_id: "",
        // cover_url:"mini-tinyblog524718.png",
        cover_url: "",
        content: ""
      },
      auto_pub:false,
      content:"",
      ruleValidate: {
        title: [
          {
            required: true,
            message: "标题不能为空",
            trigger: "blur"
          }
        ],
        desc: [
          {
            required: true,
            message: "简介不能为空",
            trigger: "blur"
          }
        ],
        category_id: [
          {
            type: "number",
            required: true,
            message: "分类必选",
            trigger: "change"
          }
        ],
        cover_url: [
          {
            required: true,
            message: "封面不能为空",
            trigger: "change"
          }
        ],
        content: [
          {
            required: true,
            message: "文章内容不能为空",
            trigger: "blur"
          }
        ]
      },
      id:"",
      editObj:"",
      visible: false
    };
  },

  methods: {
    ...mapMutations(["closeTag"]),
    async _getData(id) {
      
      await this.getCat()
      this.$http.get("/api/article/detail/"+id).then(res => {
        res = res.data;
        if (res.msg == "ok") {
          let {title,desc,auto_pub,category:{id:category_id},cover_url,content} = res.data
          this.formTop = {title,desc,category_id,cover_url,content};
          this.content = content
          this.auto_pub = Boolean(+auto_pub)
          this.id = id
        }
      }).catch(err=>{
        this.$Spin.hide(); 
      })
    },
    editMount(obj) {
      this.editObj = obj
    },
    editor() {
      this.editObj.setHtml(this.content)
    },
    getCat() {
      return this.$http.get("/api/category/get").then(res => {
        res = res.data;
        if (res.msg == "ok") {
          this.cat_list = res.data;
        }
      });
    },
    handleCover(flag) {
      if (flag == "view") {
        this.visible = true;
      } else {
        this.formTop.cover_url = "";
      }
    },
    handleRemove(file) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },
    handleSuccess(res, file) {
      console.log(res);
      if (res.msg == "ok") {
        this.formTop.cover_url = res.data;
      }
      // file.url =
      //   "https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar";
      // file.name = "7eb99afb9d5f317c912f08b5212fd69a";
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: "The file format is incorrect",
        desc:
          "File format of " +
          file.name +
          " is incorrect, please select jpg or png."
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "超过限制大小",
        desc: "文件过大,请不要超过2M"
      });
    },
    handleBeforeUpload(e) {
      // const check = this.uploadList.length < 5;
      // if (!check) {
      //   this.$Notice.warning({
      //     title: "Up to five pictures can be uploaded."
      //   });
      // }
      // return check;,
    },
    handleSubmit(flag) {
      this.$refs["formValidate"].validate(valid => {
        if (valid) {
          this.loading = true
          let data = this.formTop;
          // data.flag = flag;
          data.auto_pub = Number(this.auto_pub)
          if(this.id) {
            data.id = this.id
          }
          this.$http
            .post("/api/article/edit", data)
            .then(res => {
              res = res.data;
              if (res.msg == "ok") {
                this.$Message.success(res.data);
                this.$emit("complete")
                this.loading = false
                this.content = ""
                this.editObj.setHtml("")
              }
            })
            .catch(err => {
              this.loading = false
              console.log(err);
            });
        } else {
          this.$Message.error("Fail!");
        }
      });
    }
  }
};
</script>

<style lang="less">
.article-add {
  position: relative;

  .img-box {
    max-width: 20vw;
    height: 20vh;
    position: relative;
    overflow: hidden;
    &:hover .img-operate {
      transform: translateY(0);
    }
    .img-operate {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      transform: translateY(-105%);
      transition: all 0.3s;
      .operate-box {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        & > div {
          width: 30%;
          height: 60%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          &:hover {
            background: rgba(0, 0, 0, 0.4);
            i,
            div {
              color: #fff;
            }
          }
          div {
            color: #333;
            font-size: 18px;
          }
        }
      }
    }
  }
}
</style>