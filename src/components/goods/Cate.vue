<template>
    <div>
        <!--    面包屑导航    -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!--    卡片视图    -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 树形表格 -->
            <tree-table
                class="tree-table"
                :data="cateList"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index
                index-text="#"
                border
                :show-row-hover="false">
                <!-- 是否有效模板 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>

                <!-- 排序模板 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>

                <!-- 操作模板 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row)">删除</el-button>
                </template>
            </tree-table>

            <!-- 页面分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[1, 3, 5, 10]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 编辑对话框 -->
        <el-dialog
            title="编辑分类"
            :visible.sync="editCateDialogVisible"
            width="50%"
            @close="editCateDialogClose">
            <el-form ref="editCateFormRef" :model="editCateForm" :rules="cateFormRules" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name" ref="editCateRef"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加分类对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="addCateDialogClose">
            <el-form ref="addCateFormRef" :model="addCateForm" :rules="cateFormRules" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name" ref="addCateRef"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <el-cascader
                        :options="parentCateList"
                        :props="cascaderProps"
                        v-model="selectedKeys"
                        @change="parentCateChanged"
                        clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'Cate',
        data() {
            return {
                //商品分类请求参数
                querInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                //商品分类保存数据
                cateList: [],
                //商品分类总数
                total: 0,
                //定义树形表格的列
                columns: [
                    {
                        label: '分类名称',
                        prop: 'cat_name'
                    },
                    {
                        label: '是否有效',
                        type: 'template',
                        template: 'isok'
                    },
                    {
                        label: '排序',
                        type: 'template',
                        template: 'order'
                    },
                    {
                        label: '操作',
                        type: 'template',
                        template: 'opt'
                    }
                ],
                //对话框显示与隐藏
                addCateDialogVisible: false,
                editCateDialogVisible: false,
                //添加分类表单
                addCateForm: {
                    cat_name: '',
                    cat_pid: 0,
                    cat_level: 0
                },
                //编辑分类表单
                editCateForm: {
                    cat_id: 0,
                    cat_name: ''
                },
                //分类表单验证
                cateFormRules: {
                    cat_name: [
                        { required: true, message: '请输入表单', trigger: 'blur' },
                    ]
                },
                // 父级分类的列表
                parentCateList: [],
                // 指定级联选择器的配置对象
                cascaderProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                    expandTrigger: 'hover',
                    checkStrictly: true
                },
                // 选中的父级分类的Id数组
                selectedKeys: []
            }
        },
        created () {
            this.getCateList()
        },
        methods: {
            //获取商品分类数据
            async getCateList() {
                const {data: res} = await this.$http.get('categories',{params: this.querInfo})
                if(res.meta.status !== 200) return this.$message.error('获取商品数据失败！')
                this.cateList = res.data.result
                this.total = res.data.total
            },
            //分页大小发生变化
            handleSizeChange(newSize) {
                this.querInfo.pagesize = newSize
                this.getCateList()
            },
            //分页页面发生变化
            handleCurrentChange(newPage) {
                this.querInfo.pagenum = newPage
                this.getCateList()
            },
            //添加分类按钮
            showAddDialog() {
                this.getParentCateList()
                this.addCateDialogVisible = true
            },
            //编辑按钮
            showEditDialog(cate) {
                this.editCateDialogVisible = true
                this.editCateForm.cat_id = cate.cat_id
                this.editCateForm.cat_name = cate.cat_name
            },
            //编辑对话框确定按钮
            editCate() {
                this.$refs.editCateFormRef.validate(async check => {
                    if(!check) return
                    const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {
                        cat_name: this.editCateForm.cat_name
                    })
                    if(res.meta.status !== 200) return this.$message.error('更新失败！')
                    this.$message.success(res.meta.msg)
                    this.getCateList()
                    this.editCateDialogVisible = false
                })
            },
            //编辑对话框关闭
            editCateDialogClose() {
                this.$refs.editCateFormRef.resetFields()
                this.editCateForm.cat_name = ''
                this.editCateForm.cat_id = 0
            },
            //删除分类按钮
            async removeCate(cate) {
                const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)

                if(confirmResult !== 'confirm') return this.$message.info('已取消删除！')
                const {data: res} = await this.$http.delete('categories/' + cate.cat_id)
                if(res.meta.status !== 200) return this.$message.error('删除分类失败！')
                this.$message.success('删除分类成功！')
                this.getCateList()
            },
            //获取父级分类的列表数组
            async getParentCateList() {
                const {data: res} = await this.$http.get('categories',{
                    params: {type: 2}
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('获取分类数据失败！')
                }
                this.parentCateList = res.data
            },
            //选择器选中发生变化，取出选中的id和等级
            parentCateChanged() {
                if(this.selectedKeys.length > 0) {
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                    this.addCateForm.cat_level = this.selectedKeys.length
                }else {
                    this.addCateForm.cat_pid = 0
                    this.addCateForm.cat_level = 0
                }
            },
            //对话框确定按钮，添加分类
            addCate() {
                this.$refs.addCateFormRef.validate(async check => {
                    if(!check) return
                    const {data: res} = await this.$http.post('categories', this.addCateForm)
                    if(res.meta.status !== 201) {
                        this.$message.error('添加商品分类失败！')
                    }
                    this.$message.success('添加商品分类成功！')
                    this.getCateList()
                    this.addCateDialogVisible = false
                })
            },
            //关闭对话框重置表单数据
            addCateDialogClose() {
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys = []
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }

        }

    }
</script>

<style lang="less" scoped>
    .tree-table {
        margin-top: 15px;
    }

    .el-cascader {
        width: 100%;
    }
</style>
