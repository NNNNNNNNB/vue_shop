import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome')

const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles')

const Cate = () => import(/* webpackChunkName: "cate_params_goodsList_goodsAdd" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName: "cate_params_goodsList_goodsAdd" */ '../components/goods/Params')
const GoodsList = () => import(/* webpackChunkName: "cate_params_goodsList_goodsAdd" */ '../components/goods/List')
const GoodsAdd = () => import(/* webpackChunkName: "cate_params_goodsList_goodsAdd" */ '../components/goods/Add')


const Order = () => import(/* webpackChunkName: "cate_params_goodsList_goodsAdd" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "cate_params_goodsList_goodsAdd" */ '../components/report/Report')


Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [{
            path: '/welcome',
            component: Welcome,
        },{
            path: '/users',
            component: Users
        },{
            path: '/rights',
            component: Rights
        },{
            path: '/roles',
            component: Roles
        },{
            path: '/categories',
            component: Cate
        },{
            path: '/params',
            component: Params
        },{
            path: '/goods',
            component: GoodsList
        },{
            path: '/goods/add',
            component: GoodsAdd,
        },{
            path: '/orders',
            component: Order
        },{
            path: '/reports',
            component: Report
        }]
    }
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path == '/login') return next()

    const tokenStr = window.sessionStorage.getItem('token')
    if(!tokenStr) return next('/login')
    next()
})

export default router
