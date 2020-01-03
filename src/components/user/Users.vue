<template>
    <div>
        <!--    面包屑导航    -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--    卡片视图    -->
        <el-card class="box-card">
            <!--    搜索与添加   -->
            <el-row :gutter="10">
                <el-col :span="8">
                    <el-input
                        placeholder="请输入内容"
                        class="input-with-select"
                        v-model="queryInfo.query"
                        clearable
                        @clear="getUserList">
                        <el-button
                            slot="append"
                            icon="el-icon-search"
                            @click="getUserList">
                        </el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!--      用户信息列表      -->
            <el-table border style="width: 100%" :data="userList" stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改用户信息按钮 -->
                        <el-button type="primary" @click="showEditDialog(scope.row.id)" icon="el-icon-edit" size="mini" />
                        <!-- 删除用户按钮 -->
                        <el-button type="danger" @click="removeUserById(scope.row.id)" icon="el-icon-delete" size="mini" />
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button @click="setRole(scope.row)" type="warning" icon="el-icon-setting" size="mini" />
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!--      用户分页跳转      -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <!-- 对话框主体内容 -->
            <el-form
                :model="addForm"
                :rules="FormRules"
                ref="addFormRef"
                label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户信息对话框 -->
        <el-dialog
            title="修改用户信息"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form
                :model="editForm"
                :rules="FormRules"
                ref="editFormRef"
                label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUserInfo">确 定</el-button>
                </span>
        </el-dialog>

        <!-- 分配角色对话框 -->
        <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            @close="setRoleDialogClosed">
            <div>
                <p>当前的用户：{{userInfo.username}}</p>
                <p>当前的角色：{{userInfo.role_name}}</p>
                <p>
                    分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                            v-for="item in rolesList"
                            :key="item.id"
                            :label="item.roleName"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'Users',
        data() {

            //邮箱验证规则
            const checkEmail = (rule, value, callback) => {
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                if(regEmail.test(value)) {
                    return callback()
                }

                callback(new Error('请输入合法的邮箱'))
            }

            //手机号验证规则
            const checkMobile = (rule, value, callback) => {
                const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if(regMobile.test(value)) {
                    return callback()
                }

                callback(new Error('请输入合法的手机号'))
            }

            return {
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 2
                },
                userList: [],
                total: 0,
                addDialogVisible: false,
                editDialogVisible: false,

                //添加用户表单对象
                addForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                //修改用户表单对象
                editForm: {},

                //添加或修改用户验证规则
                FormRules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                    ],
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger: 'blur' }
                    ],
                    mobile: [
                        { required: true, message: '请输入手机号', trigger: 'blur' },
                        { validator: checkMobile, trigger: 'blur' }
                    ],

                },
                //分配角色对话框显示隐藏
                setRoleDialogVisible: false,
                //当前用户信息
                userInfo: {},
                //所有用户角色
                rolesList: [],
                //分配角色下拉菜单选中的值
                selectedRoleId: '',
            }
        },
        created () {
            this.getUserList()
        },
        methods: {
            //获取用户列表数据
            async getUserList() {
                const {data: res} = await this.$http.get('/users', {params: this.queryInfo})
                if(res.meta.status !== 200) return this.$message.error('用户数据获取失败')
                this.userList = res.data.users
                this.total = res.data.total
                // console.log(this.userList)
            },
            //当页面大小被点击时，获取新的页面大小，重新获取数据
            handleSizeChange(newPageSize) {
                this.queryInfo.pagesize = newPageSize
                this.getUserList()
            },
            //当分页被点击时，转到相应的分页，重新获取数据
            handleCurrentChange(newPageNum) {
                this.queryInfo.pagenum = newPageNum
                this.getUserList()
            },
            //点击用户开关按钮触发，发送数据设置用户状态
            async userStateChanged(userInfo) {
                const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
                if (res.meta.status !== 200) {
                    userInfo.mg_state = !userInfo.mg_state
                    return this.$message.error('用户状态设置失败')
                }
                this.$message.success('用户状态设置成功')
            },
            //添加用户对话框关闭触发，重置整个表单数据
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            //修改用户信息对话框关闭触发，重置整个表单数据
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            //点击确定按钮添加新用户，添加之前验证表单规则，通过后发送添加用户数据
            addUser() {
                this.$refs.addFormRef.validate(async check => {
                    if(!check) return this.$message.error('请验证表单错误项')
                    const {data: res} = await this.$http.post('/users',this.addForm)
                    if(res.meta.status !== 201) {
                        return this.$message.error('添加用户失败')
                    }

                    this.$message.success('添加用户成功')
                    this.addDialogVisible = false
                    this.getUserList()
                })
            },
            //通过id获取用户信息，并显示修改用户信息对话框
            async showEditDialog(id) {
                const {data: res} = await this.$http.get('/users/' + id)
                if(res.meta.status !== 200) {
                    return this.$message.error('查询用户失败')
                }
                this.editForm = res.data
                this.editDialogVisible = true
            },
            //修改用户信息的确定按钮
            editUserInfo() {
                this.$refs.editFormRef.validate(async check => {
                    if (!check) return this.$message.error('请验证修改信息!')
                    const {data: res} = await this.$http.put('/users/' + this.editForm.id, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile
                    })

                    if(res.meta.status !== 200) {
                        return this.$message.error('用户信息更新失败')
                    }

                    this.$message.success('用户信息更新成功')
                    this.editDialogVisible = false
                    this.getUserList()
                })
            },
            //删除用户信息按钮，弹出对话框
            async removeUserById(id) {
                const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)

                // 确定返回confirm，取消返回cancel
                if(confirmResult !== 'confirm') return this.$message.info('已取消删除')
                const {data: res} = await this.$http.delete('/users/' + id)
                if(res.meta.status !== 200) return this.$message.error('删除用户失败')
                this.$message.success('删除用户成功')
                this.getUserList()
            },
            //分配角色按钮被点击
            async setRole(role) {
                this.userInfo = role
                const {data: res} = await this.$http.get('roles')
                if(res.meta.status !== 200) return this.$message.error('角色获取失败！')
                this.rolesList = res.data
                this.setRoleDialogVisible = true
            },
            //分配角色对话框确定按钮被点击
            async saveRoleInfo() {
                if(!this.selectedRoleId) {
                    return this.$message.error('请选择要分配的角色！')
                }

                const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
                    rid: this.selectedRoleId
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('分配角色失败！')
                }
                this.$message.success('分配角色成功')

                this.getUserList()
                this.setRoleDialogVisible =false
            },
            setRoleDialogClosed() {
                this.userInfo = {}
                this.selectedRoleId = ''
            }
        }
    }
</script>

<style scoped>

</style>
