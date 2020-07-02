import Main from '@/components/main'
import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/home/home.vue')
      }
    ]
  },
  {
    path: '/user',
    name: 'user',
    meta: {
      hideInBread: true,
      icon: 'md-people',
      title: '审核管理',
      access: ['super_admin'],
    },
    component: Main,
    children: [
      {
        path: 'umanage',
        name: 'uManage',
        meta: {
          icon: 'md-people',
          title: '审核管理',
          access: ['super_admin'],
        },
        component: () => import('@/view/manage/user_manage.vue')
      }
    ]
    
  },
  {
    path: '/article',
    name: 'article',
    meta: {
      hideInBread: true,
      title:"文章",
      icon: 'md-document',
    },
    component: Main,
    children: [
      {
        path: 'amanage',
        name: 'amanage',
        meta: {
          icon: 'md-document',
          title: '文章管理',
        },
        component: () => import('@/view/article/article_list.vue')
      }
    ]
    
  },
  {
    path: '/article',
    name: 'aOperate',
    meta: {
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'add',
        name: 'aAdd',
        meta: {
          title: "新建文章",
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/article/article_add.vue')
      },
      // {
      //   path: 'edit',
      //   name: 'aEdit',
      //   meta: {
      //     title: "编辑文章",
      //     beforeCloseName: 'before_close_normal'
      //   },
      //   component: () => import('@/view/article/article_edit.vue')
      // },
      // {
      //   path: 'query',
      //   name: 'query',
      //   meta: {
      //     icon: 'md-flower',
      //     title: route => `{{ query }}-${route.query.id}`,
      //     notCache: true
      //   },
      //   component: () => import('@/view/argu-page/query.vue')
      // }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
