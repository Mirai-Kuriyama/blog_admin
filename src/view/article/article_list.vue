<template>
  <div class="article-list">
    <div style="display:flex;align-items:center;justify-content: flex-end;">

      <div style="text-align:right;margin: 0 20px 20px 0">
        <Button size="large" icon="md-refresh" type="primary" shape="circle" @click="getData"></Button>
        <!-- <div @click="navTo">跳转</div> -->
      </div>
      <div style="text-align:right;margin: 0 20px 20px 0">
        <Button size="large" icon="md-add" type="primary" shape="circle" @click="articleAdd()"></Button>
        <!-- <div @click="navTo">跳转</div> -->
      </div>
    </div>
    <Table stripe border :columns="columns" :data="data_list">
      <template slot-scope="{ row:{ user} }" slot="auther" v-if="user_info.role<2">
        <div style="display:flex;align-items:center">
          <Avatar :src="user.avatar_url" v-if="user.avatar_url" />
          <Avatar v-else shape="square" icon="ios-person" size="small" />
          <strong style="margin-left:20px">{{ user.username }}</strong>
        </div>
      </template>
      <template slot-scope="{ row }" slot="status">
        <div>
          <strong>{{ row | stateStr }}</strong>

          <div
            style="color:blue;cursor:pointer"
            v-if="row.status == 3 || row.status == 6 || row.status == 7"
          >
            <Tooltip :content="row.reason" placement="top-start">
              <div style="color:blue;">查看原因</div>
            </Tooltip>
          </div>
        </div>
      </template>
      <template slot-scope="{ row:{created_at} }" slot="created_at">
        <p>{{ created_at | timeFormat }}</p>
      </template>
      <template slot-scope="{ row:{cover_url} }" slot="cover_url">
        <div v-if="cover_url" style="height:100px;width:100%" @click="imgView(cover_url)">
          <img
            :src="$config.imgBaseUrl+cover_url"
            alt
            style="width:100%;height:100%; object-fit: contain;"
          />
        </div>
        <div v-else style="text-align:center">无封面</div>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <div style="width:100;display:flex;flex-wrap:wrap;justify-content: center;">
          <Button
            type="primary"
            size="small"
            style="margin-right: 5px"
            @click="articleView(row.id)"
          >预览</Button>

          <div v-if="user_info.role>1">
            <Button
              type="primary"
              size="small"
              v-if="row.status==0"
              style="margin-right: 5px"
              @click="putCheckHandle(row,'put')"
            >提交审核</Button>
            <Button
              type="primary"
              size="small"
              v-if="row.status==1"
              style="margin-right: 5px"
              @click="putCheckHandle(row,'unput')"
            >撤销审核</Button>
            <Button
              type="primary"
              size="small"
              v-if="row.status==2"
              style="margin-right: 5px"
              @click="publish(row)"
            >发布</Button>
            <Button
              type="primary"
              size="small"
              v-if="row.status==4"
              style="margin-right: 5px"
              @click="reasonShow(row,'offonce',index)"
            >下架</Button>
            <Button
              type="primary"
              size="small"
              v-if="row.status==0 || row.status==2 || row.status==3 || row.status==5 || row.status==6"
              style="margin-right: 5px"
              @click="articleEditShow(row.id)"
            >修改</Button>
            <Button
              type="error"
              size="small"
              v-if="row.status!=1 && row.status!=4"
              @click="deleteHandle(row,index)"
            >删除</Button>
          </div>
          <div v-else>
            <Button
              style="margin-right:8px"
              type="error"
              size="small"
              v-if="row.status==1"
              @click="reasonShow(row,'disagree',index)"
            >不通过</Button>
            <Button
              type="primary"
              size="small"
              v-if="row.status==1"
              @click="agreeHandle(row,index)"
            >通过</Button>
            <Button
              style="margin-right:8px"
              type="warning"
              size="small"
              v-if="row.status==4"
              @click="reasonShow(row,'offonce',index)"
            >下架</Button>
            <Button
              type="error"
              size="small"
              v-if="row.status==4"
              @click="reasonShow(row,'offforever',index)"
            >永久下架</Button>
          </div>
        </div>
      </template>
    </Table>

    <Modal title="图片预览" v-model="img_view">
      <img :src="$config.imgBaseUrl+cur_img_url" v-if="cur_img_url" style="width: 100%" />
    </Modal>

    <Modal v-model="reason_show" title="下架/审核不通过理由" width="300" @on-ok="disagreeHandle">
      <div class="reason-box" style="text-align:center">
        <Input v-model="reason" placeholder="请简述理由" clearable />
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="modal_loading" @click="disagreeHandle">确认提交</Button>
      </div>
    </Modal>

    <Modal v-model="article_view" :closable="false" :transfer="false" footer-hide width="411">
      <div class="article-view">
        <img src="../../assets/images/iphone-bg.png" alt />
        <div class="view-ctt" v-html="html"></div>
      </div>
    </Modal>

    <Modal :closable="false" v-model="edit_show" footer-hide fullscreen title="文章编辑">
      <edit-form ref="editForm" @complete="editComplete"></edit-form>
      <div class="edit-header" slot="header">
        <div class="edit-title">文章编辑</div>
        <div class="edit-close" @click="closeEdit">
          <Icon type="md-close" color="red" size="40" />
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
// import {str} from "./test.js"
import { getDate } from "@/libs/tools";
import { mapState } from "vuex";
import editForm from "./article_edit";
export default {
  components: {
    editForm
  },
  filters: {
    stateStr(row) {
      let dir = {
        "0": "草稿",
        "1": "待审核",
        "2": "审核通过",
        "3": "审核未通过",
        "4": "发布中",
        "5": "已下架",
        "6": "违规下架",
        "7": "管理员下架"
      };
      return dir[row.status] || "未知状态";
    },
    timeFormat(timeStamp) {
      return getDate(timeStamp / 1000, "year");
    }
  },
  watch: {
    user_info: {
      immediate: true,
      handler(v) {
        let has_auther = false;
        for (let i = 0; i < this.columns.length; i++) {
          let el = this.columns[i];
          if (el.slot == "auther") {
            has_auther = true;
            break;
          }
        }
        let data = {
          title: "作者",
          slot: "auther",
          show: false,
          resizable: true,
          width: 200,
          tooltip: true
        };
        if (v.role < 2) {
          if (!has_auther) {
            this.columns.unshift(data);
          }
        } else {
          if (has_auther) {
            this.columns.shift(data);
          }
        }
      }
    }
  },
  data() {
    return {
      article_view: false, // 文章预览弹窗
      img_view: false, // 图片预览弹窗
      reason_show: false, // 原因弹窗
      modal_loading: false, // 提交按钮状态
      edit_show: false, // 编辑弹窗
      reason: "", // 下架原因
      cur_row: "", // 当前点击的行数据
      cur_img_url: "", // 当前预览的图片
      html: "<br>", // 当前预览的文章数据
      columns: [
        {
          title: "文章标题",
          key: "title",
          resizable: true,
          width: 280,
          tooltip: true
        },
        {
          title: "封面图",
          slot: "cover_url",
          width: 220
        },
        {
          title: "简介",
          key: "desc",
          tooltip: true
        },
        {
          title: "创建时间",
          slot: "created_at",
          width: 180
        },
        {
          title: "状态",
          width: 140,
          slot: "status"
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          fixed: "right"
        }
      ],
      data_list: [], // 列表数据
      page: 1,
      page_size: 10
    };
  },
  computed: {
    ...mapState("user", ["user_info"])
  },
  created() {
    this.getData();
  },
  methods: {
    async articleEditShow(id) {
      this.$Spin.show();
      await this.$refs.editForm._getData(id);
      this.$Spin.hide();
      this.edit_show = true;
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs.editForm.editor();
        });
      }, 1000);
    },
    editComplete() {
      this.edit_show = false;
      this.getData();
    },
    closeEdit() {
      this.$Modal.confirm({
        title: "提示",
        content: "关闭后内容不会保存,确认关闭吗?",
        onOk: () => {
          this.edit_show = false;
        }
      })
    },
    deleteHandle(row, index) {
      // 删除
      this.$Modal.confirm({
        title: "提示",
        content: "删除不可逆,确认删除吗?",
        onOk: () => {
          this.$http.get("/api/article/remove/" + row.id).then(res => {
            res = res.data;
            if (res.msg == "ok") {
              this.$Message.success("删除成功");
              this.data_list.splice(index, 1);
            } else {
              this.$Message.error(res.data);
            }
          });
        }
      });
    },

    disagreeHandle() {
      // 管理员审核不通过/下架/永久下架
      if (this.user_info.role < 2) {
        if (this.reason.trim() == "") {
          this.$Message.warning("总得让人死的明白点吧!");
          return;
        }
        this.modal_loading = true;
      }
      let url = "/api/article/disagree";
      if (this.cur_row.flag == "offonce") {
        url = "/api/article/offpubonce";
      } else if (this.cur_row.flag == "offforever") {
        url = "/api/article/offpubforever";
      }

      let data = {
        id: this.cur_row.row.id
      };
      if (this.user_info.role < 2) {
        data.reason = this.reason;
      }
      this.$http
        .post(url, data)
        .then(res => {
          res = res.data;
          if ((res.msg = "ok")) {
            this.$Message.success("操作成功");
            this.reason_show = false;
            this.getData();
          }

          setTimeout(() => {
            this.modal_loading = false;
          }, 800);
        })
        .catch(err => {
          this.modal_loading = false;
        });
    },
    reasonShow(row, flag, index) {
      this.cur_row = {
        row,
        flag,
        index
      };
      if (this.user_info.role < 2) {
        this.reason_show = true;
      } else {
        this.disagreeHandle();
      }
    },
    agreeHandle(row, index) {
      // 审核通过请求
      // 审核
      let url = "/api/article/agree/";
      this.$http.get(url + row.id).then(res => {
        res = res.data;
        if ((res.msg = "ok")) {
          this.$Message.success("操作成功");
          if (row.auto_pub == 1) {
            row.status = 4;
          } else {
            row.status = 2;
          }
        }
      });
    },
    publish(row) {
      // 发布
      this.$http.get("/api/article/publish/" + row.id).then(res => {
        res = res.data;
        if ((res.msg = "ok")) {
          this.$Message.success("操作成功");
          row.status = 4;
        }
      });
    },
    getData() {
      // 获取列表
      let data = {
        page: this.page,
        page_size: this.page_size
      };
      this.$http
        .post("/api/article/list", data)
        .then(res => {
          res = res.data;
          if (res.msg == "ok") {
            this.data_list = res.data.rows;
            this.$Message.success("数据更新成功")
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    imgView(url) {
      // 预览图片
      if (url) {
        this.cur_img_url = url;
        this.img_view = true;
      } else {
        this.$Message.error("没有封面图");
      }
    },
    articleView(id) {
      // 预览文章
      this.$http
        .get("/api/article/detail/" + id)
        .then(res => {
          res = res.data;
          if (res.msg == "ok") {
            this.html = res.data.content;
            this.$nextTick(() => {
              this.article_view = true;
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    putCheckHandle(row, flag) {
      // 提交/撤销审核
      // 提交审核

      let url = "/api/article/putcheck/";
      if (flag == "unput") {
        url = "/api/article/unputcheck/";
      }

      this.$http.get(url + row.id).then(res => {
        console.log(res);
        res = res.data;
        if ((res.msg = "ok")) {
          this.$Message.success("操作成功");
          row.status = flag == "put" ? 1 : 0;
        }
      });
    },
    articleAdd() {
      // 添加
      const route = {
        name: "aAdd"
      };
      this.$router.push(route);
    }
  }
};
</script>
<style lang="less">
.edit-header {
  position: relative;
  .edit-title {
    font-size: 24px;
    text-align: center;
  }
  .edit-close {
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
}
.article-list {
  /deep/ .ivu-modal-content {
    background: transparent;
    box-shadow: none;
    .ivu-modal-body {
      padding: 0;
      border: none;
    }
  }

  .article-view {
    position: relative;
    /deep/ .view-ctt {
      width: 368px;
      height: 636px;
      padding: 20px;
      box-sizing: border-box;
      // background: red;
      position: absolute;
      left: 50%;
      top: 100px;
      transform: translateX(-50%);
      overflow-y: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      /*火狐下隐藏滚动条*/
      overflow: -moz-scrollbars-none;
      &::-webkit-scrollbar {
        display: none;
      }
      img {
        width: 100%;
      }
      table,
      ul {
        width: 100% !important;
        box-sizing: border-box !important;
      }
    }
  }
}
</style>