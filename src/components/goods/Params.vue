<template>
    <div>
        <!--    面包屑导航    -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 警告区域 -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                :closable="false"
                show-icon>
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader
                        v-model="selectedCateKeys"
                        :options="cateList"
                        :props="cateProps"
                        @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tab 页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- many 页签 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button @click="addFormDialogVisible = true" size="mini" type="primary" :disabled="isBtnDisabled">添加参数</el-button>
                    <el-table
                        :data="manyTableData"
                        border
                        stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 渲染的界面标签 -->
                                <el-tag @close="deleteTag(index,scope.row)" closable :key="index" v-for="(item,index) in scope.row.attr_vals">{{item}}</el-tag>
                                <!-- input标签输入框 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 点击显示input按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                                <el-button @click="removeParams(scope.row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- only 页签 -->
                <el-tab-pane label="静态参数" name="only">
                    <el-button @click="addFormDialogVisible = true" size="mini" type="primary" :disabled="isBtnDisabled">添加属性</el-button>
                    <el-table
                        :data="onlyTableData"
                        border
                        stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 渲染的界面标签 -->
                                <el-tag @close="deleteTag(index,scope.row)" closable :key="index" v-for="(item,index) in scope.row.attr_vals">{{item}}</el-tag>
                                <!-- input标签输入框 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 点击显示input按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                                <el-button @click="removeParams(scope.row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数对话框 -->
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addFormDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <el-form
                :model="addForm"
                :rules="formRules"
                ref="addFormRef"
                label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addFormDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数对话框 -->
        <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editFormDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form
                :model="editForm"
                :rules="formRules"
                ref="editFormRef"
                label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editFormDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'Params',
        data(){
            return {
                //商品列表数据
                cateList: [],
                //选择器选中数据
                selectedCateKeys: [],
                //选择器规则定义
                cateProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                    expandTrigger: 'hover'
                },
                //tab选中的页签
                activeName: 'many',
                //动态数据
                manyTableData: [],
                //静态数据
                onlyTableData:[],
                //添加动态参数对话框显示隐藏
                addFormDialogVisible: false,
                editFormDialogVisible: false,
                //添加参数数据
                addForm: {
                    attr_name: '',
                },
                editForm: {},
                //添加参数表单验证
                formRules: {
                    attr_name: [
                        { required: true, message: '请输入名称', trigger: 'blur' },
                    ]
                },
            }
        },
        created () {
            this.getCateList()
        },
        computed: {
            //计算添加按钮是否禁用属性
            isBtnDisabled() {
                if(this.selectedCateKeys.length !== 3) {
                    return true
                }
                return false
            },
            //计算当前选中的三级分类Id
            cateId() {
                if(this.selectedCateKeys.length === 3) {
                    return this.selectedCateKeys[2]
                }
                return null
            },
            //计算添加参数对话标题
            titleText() {
                if(this.activeName === 'many') {
                    return '动态参数'
                }
                return '静态属性'
            }
        },
        methods: {
            //获取所有商品列表信息
            async getCateList() {
                const {data: res} = await this.$http.get('categories')
                if(res.meta.status !== 200) {
                    return this.$message.error('获取商品列表失败！')
                }
                this.cateList = res.data
            },
            //获取参数信息
            async getParamsData() {
                //没有选中3级分类则清空数据退出
                if(this.selectedCateKeys.length !== 3) {
                    this.selectedCateKeys = []
                    this.manyTableData = []
                    this.onlyTableData = []
                    return
                }

                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                    params: {sel: this.activeName}
                })

                if(res.meta.status !== 200) {
                    return this.$message.error('获取参数列表失败！')
                }

                //拿到attr_vals中的标签，转化为数组，
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : []

                    //添加渲染的识别数据
                    item.inputVisible = false
                    item.inputValue = ''
                })

                if(this.activeName === 'many') {
                    this.manyTableData = res.data
                }else {
                    this.onlyTableData = res.data
                }
            },
            //选择器发生变化
            handleChange() {
                this.getParamsData()
            },
            //页签被点击触发
            handleTabClick() {
                this.getParamsData()
            },
            //添加参数对话框关闭
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            //添加参数对话框确定按钮
            addParams() {
                this.$refs.addFormRef.validate(async check => {
                    if(!check) return
                    const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    })

                    if(res.meta.status !== 201) {
                        this.$message.error('添加参数失败！')
                    }
                    this.$message.success('添加参数成功！')
                    this.addFormDialogVisible = false
                    this.getParamsData()
                })
            },
            //修改按钮被点击
            async showEditDialog(id) {
                this.editFormDialogVisible = true
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{
                    params: {attr_sel: this.activeName}
                })

                if(res.meta.status !== 200) return
                this.editForm = res.data
            },
            //修改参数对话框确定按钮
            editParams() {
                this.$refs.editFormRef.validate(async check => {
                    if(!check) return

                    const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                            attr_name: this.editForm.attr_name,
                            attr_sel: this.activeName
                    })

                    if(res.meta.status !== 200) {
                        return  this.$message.error('修改参数失败！')
                    }

                    this.$message.success('修改参数成功！')
                    this.getParamsData()
                    this.editFormDialogVisible = false
                })
            },
            //修改对话框关闭
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            //删除按钮操作
            async removeParams(attr_id) {
                const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)

                if(confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除操作！')
                }

                const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
                if(res.meta.status !== 200) {
                    return this.$message.error('删除失败！')
                }

                this.$message.success('删除成功！')
                this.getParamsData()
            },
            //标签输入框失去焦点事件
            async handleInputConfirm(row) {
                //去掉空格判断长度
                if(row.inputValue.trim().length === 0) {
                    row.inputVisible = false
                    row.inputValue = ''
                    return
                }

                row.attr_vals.push(row.inputValue.trim())
                row.inputVisible = false
                row.inputValue = ''

                this.saveAttrvals(row)
            },
            //标签按钮点击
            showInput(row) {
                row.inputVisible = true
                //页面重新渲染就触发，获取输入框焦点
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            //点击删除tag标签
            deleteTag(index, row) {
                row.attr_vals.splice(index,1)
                this.saveAttrvals(row)
            },
            //修改参数项目
            async saveAttrvals(row) {
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(" ")
                })

                if(res.meta.status !== 200) {
                    return this.$message.error('更新参数项失败！')
                }
                this.$message.success('更新参数项成功！')
            }
        }
    }
</script>

<style lang="less" scoped>
    .cat_opt {
        margin-top: 15px;
    }

    .el-tag {
        margin: 10px;
    }

    .input-new-tag {
        width: 120px;
    }
</style>
