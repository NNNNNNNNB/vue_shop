<template>
    <div>
        <!--    面包屑导航    -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品添加</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 警告条 -->
            <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>

            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏切换区域 -->
            <el-form
                :model="addForm"
                :rules="formRules"
                ref="addFormRef"
                label-position="top"
                label-width="100px">
                <el-tabs
                    v-model="activeIndex"
                    tab-position="left"
                    :before-leave="beforeTabLeave"
                    @tab-click="tabClocked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="Number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="Number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number" type="Number">
                            <el-input v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                v-model="addForm.goods_cat"
                                :options="cateList"
                                :props="cascaderProps"
                                @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for="(item,index) in manyTableData"
                                      :key="index"
                                      :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox v-for="(cb,i) in item.attr_vals"
                                             :key="i"
                                             :label="cb"
                                             border>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item
                            v-for="(item,index) in onlyTableData"
                            :key="item.attr_id"
                            :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :action="uploadUrl"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            list-type="picture"
                            :headers="headerObj">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>

                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>

                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible">
            <img :src="previewPaht" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
    import _ from 'lodash'
    export default {
        name: 'Add',
        data() {
            return {
                //步骤条索引
                activeIndex: '0',
                //添加商品表单数据
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    goods_cat: [],
                    pics: [],
                    goods_introduce: '',
                    attrs: []
                },
                //商品表单数据验证
                formRules: {
                    goods_name: [
                        { required: true, message: '请输入商品名称', trigger: 'blur' },
                    ],
                    goods_price: [
                        { required: true, message: '请输入商品价格', trigger: 'blur' },
                    ],
                    goods_weight: [
                        { required: true, message: '请输入商品重量', trigger: 'blur' },
                    ],
                    goods_number: [
                        { required: true, message: '请输入商品数量', trigger: 'blur' },
                    ],
                    goods_cat: [
                        { required: true, message: '请输入三级商品分类', trigger: 'blur' },
                    ]
                },
                //商品分类列表
                cateList: [],
                //级联选择器规则
                cascaderProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children',
                    expandTrigger: 'hover',
                },
                //动态参数列表
                manyTableData: [],
                //静态参数列表
                onlyTableData: [],
                //图片上传地址
                uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
                //图片上传请求头
                headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                //图片上传后的访问地址
                previewPaht: '',
                //图片预览对话框显示与隐藏
                previewVisible: false
            }
        },
        created () {
            this.getCateList()
        },
        methods: {
            //获取所有商品分类信息
            async getCateList() {
                const {data: res} = await this.$http.get('categories')
                if(res.meta.status !== 200) return this.$message.error('获取商品数据失败！')
                this.cateList = res.data
            },
            //选择器选中触发
            handleChange() {
                if(this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = []
                }
            },
            //标签页切换触发，activeName要切换的页，oldActiveName切换前的页
            beforeTabLeave(activeName, oldActiveName) {
                if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                    this.$message.error('请选择商品分类！')
                    return false
                }
            },
            //标签页被点击触发
            async tabClocked() {
                if(this.activeIndex === '1') {
                    const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                        params: {sel: 'many'}
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('获取动态参数列表失败！')
                    }

                    res.data.forEach(item => {
                        item.attr_vals = item.attr_vals === 0 ? [] : item.attr_vals.split(" ")
                    })

                    this.manyTableData = res.data

                } else if(this.activeIndex === '2') {
                    const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                        params: {sel: 'only'}
                    })
                    if(res.meta.status !== 200) {
                        return this.$message.error('获取动态参数列表失败！')
                    }
                    this.onlyTableData = res.data
                }
            },
            //点击上传的图片预览事件
            handlePreview(file) {
                this.previewPaht = file.response.data.url
                this.previewVisible = true
            },
            //点击移除图片触发的事件
            handleRemove(file) {
                console.log(file)
                const filepath = file.response.data.tmp_path
                const index = this.addForm.pics.findIndex(v => v.pic === filepath)
                this.addForm.pics.splice(index,1)
                console.log(this.addForm)
            },
            //图片上传成功事件
            handleSuccess(response) {
                const picInfo = {pic: response.data.tmp_path}
                this.addForm.pics.push(picInfo)
            },
            //添加商品按钮
            add() {
                this.$refs.addFormRef.validate(async check => {
                    if(!check) {
                        return this.$message.error('请填写必要的表单项！')
                    }

                    //将表单对象深度拷贝
                    const form = _.cloneDeep(this.addForm)
                    form.goods_cat = form.goods_cat.join(",")

                    this.manyTableData.forEach(item => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals.join(" ")
                        }
                        this.addForm.attrs.push(newInfo)
                    })
                    this.onlyTableData.forEach(item => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals
                        }
                        this.addForm.attrs.push(newInfo)
                    })

                    form.attrs = this.addForm.attrs

                    //发生添加商品数据
                    const {data: res} = await this.$http.post('/goods', form)
                    if(res.meta.status !== 201) {
                        return this.$message.error('添加商品失败！')
                    }
                    this.$message.success('添加商品成功！')
                    this.$router.push('/goods')
                })
            }
        },
        computed: {
            //获取选择器选中的商品参数
            cateId() {
                if(this.addForm.goods_cat.length === 3) {
                    return this.addForm.goods_cat[2]
                }
                return null
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }

    .previewImg {
        width: 100%;
    }

    .btnAdd {
        margin-top: 15px;
    }
</style>
