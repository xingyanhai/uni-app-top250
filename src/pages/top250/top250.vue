

<template>
	<view class="wrap">
		<view class="list" v-if="dataList && dataList.length">
			<view class="item" v-for="(value, index) in dataList"
				  :key="index"
				  @tap="toDetail(value)">
				<view class="title">
					{{value.questionName}}
				</view>
				<view class="content">
					<view class="left">
						<view class="author">
							<view class="author-left">
								<image class="author-img" :src="value.authorImg"></image>
								<view class="author-name">{{value.authorName}}</view>
							</view>
							<view class="author-text">{{value.authorBadgeText}}</view>
						</view>
						<view>
							<view class="answer-up-num">{{value.answerUpNum}}赞</view>
							<view>共{{value.answerImgList.length}}张图片</view>
						</view>
						<view>{{value.editTimeText}}</view>
					</view>
					<view class="right">
						<image class="img" mode="aspectFill" :src="value.answerImgList[0]"></image>
					</view>
				</view>
				<view class="bottom">
					<view class="num1">问题关注量{{value.questionFollowNum}}</view>
					<view>浏览量{{value.questionReadNum}}</view>
				</view>
			</view>
		</view>
		<view class="common-no-data-box">
			{{loadMoreText || ''}}
		</view>
	</view>
</template>

<script>
	import SearchBtn from '../components/search-btn'

	import {
		mapState,
		mapMutations
	} from 'vuex'
	import {request} from '../../api/fetch'
	import HtmlToJson from '../wxParse/html2json'
	export default {
		data() {
			return {
				search: '',
				loadMoreText: '加载中...',
				pageNo:1,
				pageSize: 20,
				dataList: [],
				loading: false,
				start: 0
			};
		},
		components: {SearchBtn},
        computed: mapState(['userInfo']),
		methods: {
			...mapMutations(['getUserInfo','setStateData']),
			copy (item) {
				console.log(item)
				let text = `${item.src}\n${item.text}`
				wx.setClipboardData({
					data: text,
					success (res) {
						wx.getClipboardData({
							success (res) {
								console.log(res.data) // data
							}
						})
					}
				})
			},
			// 树状结构转平行结构
			changeData (item, arr) {
				arr.push(item)
				if (item.nodes && item.nodes.length) {
					for(let i = 0; i < item.nodes.length;i++) {
						this.changeData(item.nodes[i], arr)
					}
				}
			},
			getSaveData (arr) {
				let obj = {}
				for(let i = 0;i<arr.length;i++) {
					try {
						let item = arr[i]
						if(item.tag === 'img') {
							obj.coverImgSrc = item.attr.src
						} else if (item.tag === 'a' && item.attr.href.startsWith('https://movie.douban.com') && item.nodes && item.nodes.length > 1) {
							let url = item.attr.href
							obj.url = url
							obj.movieId = url.split('/')[url.split('/').length - 2]
							obj.name = item.nodes[0].nodes[0].text
						} else if(item.classStr === 'other') {
							obj.otherName = item.nodes[0].text
						} else if(item.classStr === 'bd') {
							obj.actorText = `${item.nodes[0].nodes[0].text}`.trim()
							obj.typeText = `${item.nodes[0].nodes[2].text}`.trim()
						} else if(item.tag === 'em') {
							obj.index = item.nodes[0].text
						} else if(item.classStr === 'rating_num') {
							obj.score = item.nodes[0].text
						} else if(`${item.text}`.endsWith('人评价')) {
							obj.commitCount = item.text
						} else if(`${item.classStr}` === 'inq') {
							obj.oneWord = item.nodes && item.nodes[0] && item.nodes[0].text
						}
					} catch (e) {
						console.log(e)
					}
				}
				return obj
			},
			getChildNodes (nodes, targetArr) {
				if(nodes && nodes.length) {
					for(let i = 0;i<nodes.length;i++) {
						if(nodes[i].classStr === 'grid_view') {
							targetArr.push(...nodes[i].nodes)
							return
						}
						this.getChildNodes(nodes[i].nodes, targetArr)
					}
				}
			},
			/* ----------------------获取豆瓣电影 start--------------- */
			async getMovieList (data) {
				let url = `https://movie.douban.com/top250`;
				let returnData;
				try {
					// 渲染URL
					const html = await request({
						url,
						data: {
							start: data.start
						},
						header: {
							"Content-Type": "application/text"
						},
						timeout: 60000,
					});
					let transData = HtmlToJson.html2json(html, 'htmlData');
					// 这里循环遍历至到找到 node.classStr = 'grid_view'
					let nodes = transData.nodes
					let targetArr = [];
					this.getChildNodes(nodes, targetArr)
					let saveList = []
					for(let i = 0; i < targetArr.length; i++) {
						let itemArr = []
						this.changeData(targetArr[i], itemArr)
						let saveData = this.getSaveData(itemArr)
						saveList.push(saveData)
					}
					returnData = saveList
				} catch (err) {
					console.log(`page发生错误：${err}`);
				}
				return returnData
			},
			// 获取豆瓣电影
			async getDoubanMovie() {
				if (this.loading) {
					return
				}
				if (this.dataList.length === 250) {
					this.loadMoreText = '没有更多数据了'
					return
				}
				try {
					this.loading = true
					this.loadMoreText = '加载中, 请稍后...'
					let res = await this.getMovieList({
						start: this.start
					})
					if (res && res.length) {
						this.dataList.push(...res)
					}

					if(this.dataList.length === 250) {
						this.loadMoreText = '没有更多数据了'
					} else {
						this.loadMoreText = '上拉加载更多'
						this.start += 25
					}
					this.loading = false
					console.log('res---', res)
					// let arr = []
					// for (let i = 0; i < 250; i += 25) {
					// 	arr.push(
					// 			this.getMovieList({
					// 				start: i
					// 			})
					// 	)
					// }
					// let res = await Promise.all(arr)
					// if (res && res.length) {
					// 	res.forEach(e => {
					// 		if (e.length) {
					// 			returnData.push(...e)
					// 		}
					// 	})
					// }
				} catch (err) {
					console.log(err)
				}
			},
			/* ----------------------获取豆瓣电影 end--------------- */

			toDetail (data) {
				uni.navigateTo({
					url: `/pages/answer/detail?id=${data._id}`
				})
			}
		},
		onReachBottom() {
			this.getDoubanMovie();
		},
		// 加了这个页面才可以被分享
		onShareAppMessage: function (res) {
		},
		async onLoad() {
			this.getDoubanMovie()
		}
	}
</script>

<style lang="stylus" scoped>
	@import "../../uni.styl"
.wrap
	display block
	width 100%
.search-box
	box-sizing border-box
	display block
	width 100%
	padding 10px

.list
	display flex
	flex-direction column
	width 100%
	.item
		display block
		margin 5px
		padding 5px
		border-radius 5px
		background-color #fff
		.title
			width 100%;
			font-size 18px
			margin 5px 0
		.content
			display flex
			width 100%
			overflow hidden
			justify-content space-between
			.left
				display block
				flex 1
				max-width calc(100vw - 120px)
				.answer-up-num
					margin-right 10px
				.author
					line-height 30px
					width 100%
					display flex
					align-items center
					font-size 12px;
					.author-left
						display flex
						align-items center
						.author-img
							width 22px;
							height 22px;
							border-radius 2px
						.author-name
							padding-left 3px
							white-space nowrap
					.author-text
						color $uni-text-light-color
						padding-left 3px
						flex 1
						white-space: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;
						word-break: break-all;
			.right
				padding-left: 12px;
				overflow hidden
				flex-shrink 0
				.img
					border-radius: 4px;
					height: 60px;
					width: 90px;
		.bottom
			display flex
			font-size 12px
			line-height 30px
			justify-content flex-end
			view
				color $uni-text-light-color
			.num1
				margin-right 10px
.center
	text-align center
	margin 20px 0
	color #999
	width 100%
	display block
</style>
