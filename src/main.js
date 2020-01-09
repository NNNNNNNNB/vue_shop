import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

//字体图标
import './assets/fonts/iconfont.css'

//全局样式表
import './assets/css/global.css'

//树形表格组件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',TreeTable)

//富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

//配置axios网络请求
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
