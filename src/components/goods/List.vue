<template>
    <div>
        <!--    面包屑导航    -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 商品列表区域 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="150px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | formatDate}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button @click="removeById(scope.row.goods_id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    import {formatDate} from '../../common/utils'
    export default {
        name: 'List',
        data() {
            return {
                //查询商品列表参数
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                //商品列表
                goodsList: [],
                //商品总条数
                total: 0
            }
        },
        created () {
            this.getGoodsList()
        },
        filters: {
            //格式化时间
            formatDate(time) {
                time *= 1000
                const data = new Date(time)
                return formatDate(data,'yyyy-MM-dd hh:mm:ss')
            }
        },
        methods: {
            //获取商品列表数据
            async getGoodsList() {
                const {data: res} = await this.$http.get('goods',{
                    params: this.queryInfo
                })

                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品列表失败！')
                }
                this.goodsList = res.data.goods
                this.total = res.data.total
            },
            //分页大小发生变化
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getGoodsList()
            },
            //分页页码发生变化
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            //根据商品id删除商品
            async removeById(goods_id) {
                //1.弹框判断是否删除
                const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if(confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除！')
                }

                //2.确认删除，发送删除请求
                const {data: res} = await this.$http.delete('goods/' + goods_id)
                if(res.meta.status !== 200) {
                    return this.$message.error('删除商品失败！')
                }
                this.$message.success('删除商品成功！')
                this.getGoodsList()
            },
            //添加商品按钮，跳转添加商品页面
            goAddPage() {
                this.$router.push('/goods/add')
            }
        }
    }
</script>

<style lang="less" scoped>

</style>
