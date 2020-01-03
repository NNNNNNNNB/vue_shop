<template>
    <div>
        <!--    面包屑导航    -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--    卡片视图    -->
        <el-card>
            <!-- 添加角色按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '','vcenter']" :key="item1.id" v-for="(item1,index1) in scope.row.children">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRigthById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>

                            <!-- 渲染二级权限 -->
                            <el-col :span="19">
                                <el-row :class="[index2 === 0 ? '' :'bdtop','vcenter']" :key="item2.id" v-for="(item2,index2) in item1.children">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRigthById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>

                                    <!-- 渲染三级权限 -->
                                    <el-col :span="18">
                                        <el-tag type="warning"
                                                :key="item3.id"
                                                closable
                                                @close="removeRigthById(scope.row, item3.id)"
                                                v-for="(item3,index3) in item2.children">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button @click="showEditDialog(scope.row)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button size>
                        <el-button @click="removeRoleById(scope.row.id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button
                            size="mini"
                            type="warning"
                            icon="el-icon-setting"
                            @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加角色对话框 -->
        <el-dialog
            title="添加角色"
            :visible.sync="addRoleDialogVisible"
            width="50%"
            @close="addRoleDialogClosed">
            <!-- 对话框主体内容 -->
            <el-form
                :model="addRoleForm"
                :rules="FormRules"
                ref="addRoleFormRef"
                label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addRoleDialog">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑角色对话框 -->
        <el-dialog
            title="编辑角色"
            :visible.sync="editRoleDialogVisible"
            width="50%"
            @close="editRoleDialogClosed">
            <!-- 对话框主体内容 -->
            <el-form
                :model="editRoleForm"
                :rules="FormRules"
                ref="editRoleFormRef"
                label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                    <el-button @click="editRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRoleDialog">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog
            title="分配角色权限"
            :visible.sync="setRightDialogVisible"
            width="50%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree
                :data="rightsList"
                :props="treeProps"
                show-checkbox
                default-expand-all
                node-key="id"
                :default-checked-keys="defKeys"
                ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'Roles',
        data() {
            return {
                //角色列表
                rolesList: [],
                //权限列表
                rightsList: [],
                //对话框显示隐藏
                setRightDialogVisible: false,
                addRoleDialogVisible: false,
                editRoleDialogVisible: false,
                //角色表单数据
                addRoleForm: {},
                editRoleForm: {},
                //角色表单验证
                FormRules: {
                    roleName: [
                        { required: true, message: '请输入角色名称', trigger: 'blur' }
                    ],
                    roleDesc: [
                        { required: true, message: '请输入角色描述', trigger: 'blur' }

                    ]

                },
                //树形控件的属性绑定对象
                treeProps: {
                    children: 'children',
                    label: 'authName'
                },
                //树形控件选中列表
                defKeys: [],
            }
        },
        created () {
            this.getRolesList()
        },
        methods: {
            //获取角色列表数据
            async getRolesList() {
                const {data: res} = await this.$http.get('/roles')
                if(res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
                this.rolesList = res.data
            },
            //添加角色对话框确定按钮被点击
            addRoleDialog() {
                //1.检查表单验证信息
                this.$refs.addRoleFormRef.validate(async check => {
                    if(!check) return this.$message.error('请验证添加角色信息！')

                    //2.发送添加角色数据
                    const {data: res} = await this.$http.post('/roles',this.addRoleForm)
                    if(res.meta.status !== 201) {
                        return this.$message.error('添加角色失败！')
                    }
                    this.$message.success('添加角色成功！')

                    //2.更新角色列表隐藏对话框
                    this.getRolesList()
                    this.addRoleDialogVisible = false
                })
            },
            //添加角色对话框关闭，重置整个表单数据
            addRoleDialogClosed() {
                this.$refs.addRoleFormRef.resetFields()
            },
            //删除tag标签中的权限
            async removeRigthById(role, rightId) {
                //1.当tag关闭按钮被点击时弹出对话框
                const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if(confirmResult !== 'confirm') {
                    return this.$message.info('取消了删除操作！')
                }

                //2.发送删除角色权限数据
                const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if(res.meta.status !== 200) return this.$message.error('删除权限失败')
                role.children = res.data
            },
            //显示分配权限对话框
            async showSetRightDialog(role) {
                const {data: res} = await this.$http.get('rights/tree')
                if(res.meta.status !== 200) return this.$message.error('获取权限失败！')
                this.rightsList = res.data
                this.roleId = role.id
                this.getLeafKeys(role, this.defKeys)
                this.setRightDialogVisible = true
            },
            //递归获取三级节点id
            getLeafKeys(node, arr) {
                //1.如果是三级节点，就将id传入
                if(!node.children) {
                    return arr.push(node.id)
                }

                //2.如果不是三级节点，将遍历出来的子节点传入递归
                node.children.forEach(item => {
                    this.getLeafKeys(item, arr)
                })
            },
            //权限对话框关闭初始化默认勾选列表
            setRightDialogClosed() {
                this.defKeys = []
            },
            //权限对话框点击了确定按钮
            async allotRights() {
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                const strId = keys.join(',')
                const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,{
                    rids: strId
                })
                if(res.meta.status !== 200) {
                    return this.$message.error('分配权限失败！')
                }
                this.$message.success('分配权限成功！')
                this.getRolesList()
                this.setRightDialogVisible = false
            },
            //修改角色按钮被点击
            showEditDialog(role) {
                this.editRoleForm = {
                    id: role.id,
                    roleName: role.roleName,
                    roleDesc: role.roleDesc
                }
                this.editRoleDialogVisible = true
            },
            //修改角色对话框确定按钮被点击
            editRoleDialog() {
                this.$refs.editRoleFormRef.validate(async check => {
                    if(!check) {
                        return this.$message.error('请验证修改信息！')
                    }

                    const {data: res} = await this.$http.put('roles/' + this.editRoleForm.id,{
                        roleName: this.editRoleForm.roleName,
                        roleDesc: this.editRoleForm.roleDesc
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('修改角色信息失败！')
                    }
                    this.$message.success('修改角色信息成功！')
                    this.editRoleDialogVisible = false
                    this.getRolesList()
                })
            },
            //修改角色对话框被关闭
            editRoleDialogClosed() {
                this.$refs.editRoleFormRef.resetFields()
            },
            //删除角色按钮被点击
            async removeRoleById(id) {
                //1.弹出对话框
                const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)

                //2.判断确认或取消，发送删除请求
                if(confirmResult !== 'confirm') return this.$message.info('已取消删除角色操作！')

                const {data: res} = await this.$http.delete('roles/' + id)
                if(res.meta.status !== 200) return this.$message.error('删除角色失败！')
                this.$message.success("删除角色成功！")
                this.getRolesList()
            }

        }
    }
</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>
