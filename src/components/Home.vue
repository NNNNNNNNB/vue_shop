<template>
    <el-container class="home-container">
        <!--    头部区域    -->
        <el-header>
            <div>
                <img src="../assets/img/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>

        <!--    主体区域    -->
        <el-container>
            <!--      侧边栏      -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!--        nav标签        -->
                <el-menu default-active="2" class="el-menu-vertical-demo" background-color="#333744" text-color="#fff"
                         active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false"
                         router :default-active="activePath">
                    <!--       一级菜单       -->
                    <el-submenu :index="item.id+ ''" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="iconsObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>

                        <!--  二级菜单   -->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                                      @click="activeNavPath('/' + subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!--      主要显示区域      -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        name: 'Home',
        data() {
            return {
                menuList: [],
                iconsObj: {
                    '125': 'iconfont icon-user',
                    '103': 'iconfont icon-tijikongjian',
                    '101': 'iconfont icon-shangpin',
                    '102': 'iconfont icon-danju',
                    '145': 'iconfont icon-baobiao'
                },
                isCollapse: false,
                activePath: ''
            }
        },
        created () {
            this.getMenuList()
            this.activePath = window.sessionStorage.getItem('activePath')
        },
        methods: {
            //退出登录按钮，清除token返回/login页面
            logout() {
                window.sessionStorage.clear()
                this.$router.push('/login')
            },
            //获取MenuList菜单数据
            async getMenuList() {
                const { data: res} = await this.$http.get('/menus')
                if(res.meta.status !== 200) this.$message.error(res.meta.msg)
                this.menuList = res.data
            },
            //侧边栏的折叠项被点击
            toggleCollapse() {
                this.isCollapse = !this.isCollapse
            },
            //点击二级菜单，设置当前要激活的路径
            activeNavPath(activePath) {
                window.sessionStorage.setItem('activePath',activePath)
                this.activePath = activePath
            }
        }
    }
</script>

<style lang="less" scoped>
    .home-container {
        height: 100%;
    }

    .el-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 0;
        background-color: #373d41;
        color: #fff;
        font-size: 20px;
        > div {
            display: flex;
            align-items: center;
            span {
                margin-left: 15px;
            }
        }
    }

    .el-aside {
        background-color: #333744;

        .el-menu {
            border-right: none;
        }

        .el-menu-item {
            font-size: 12px;
        }
    }

    .el-main {
        background-color: #eaedf1;
    }

    .iconfont {
        margin-right: 10px;
    }

    .toggle-button {
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: .2em;
        cursor: pointer;
    }
</style>
