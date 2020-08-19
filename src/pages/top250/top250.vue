

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
	// import cheerio from 'cheerio'
	import {request} from '../../api/fetch'
	export default {
		data() {
			return {
				search: '',
				loadMoreText: '加载中...',
				pageNo:1,
				pageSize: 20,
				dataList: [],
				loading: false
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

			/* ----------------------获取豆瓣电影 start--------------- */
			async getMovieList (data) {
				let returnData;
				// 打开页面时间
				const startTime = new Date();
				// 渲染URL
				const url = `https://movie.douban.com/top250`;
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
				try {
					// 使用request.js库发送get请求
					// const html = await request({
					// 	url,
					// 	data: {
					// 		start: data.start
					// 	},
					// 	header: {
					// 		"Content-Type": "application/text"
					// 	},
					// 	timeout: 60000,
					// });
					// 载入并初始化cheerio
					// const $ = cheerio.load(html);
					// let $list = $('.grid_view .item')
					// let saveData = []
					// for (let i = 0; i < $list.length; i++) {
					// 	let $item = $($list[i])
					// 	let url = $item.find('.info a').attr('href');
					// 	let index = Number($item.find('.pic em').text())
					// 	let coverImgSrc = $item.find('.pic img').attr('src')
					// 	let name = $item.find('.info a span').eq(0).text()
					// 	let totalName = $item.find('.info a').text()
					// 	let infoList = $item.find('.info .bd p').eq(0).text().split('\n')
					// 	let actorText = infoList[1]
					// 	let typeText = infoList[2]
					// 	let score = $item.find('.info .rating_num').text()
					// 	let commitCount = $item.find('.star span').last().text()
					// 	let oneWord = $item.find('.info .quote .inq').text()
					// 	saveData.push({
					// 		url,
					// 		movieId: url.split('/')[url.split('/').length - 2],
					// 		index,
					// 		coverImgSrc,
					// 		name,
					// 		totalName,
					// 		actorText,
					// 		typeText,
					// 		score,
					// 		commitCount,
					// 		oneWord,
					// 	})
					// }
					// returnData = saveData;
				} catch (err) {
					console.log(`page发生错误：${err}`);
				}
				console.log(`页面耗时: ${new Date() - startTime}ms，渲染页URL：${url}`);
				return returnData
			},
			// 获取豆瓣电影
			async getDoubanMovie(data) {
				let returnData = []
				// 打开页面时间
				const startTime = new Date();
				try {
					this.getMovieList({
						start: 0
					})

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
				console.log(`页面耗时: ${new Date() - startTime}ms，渲染页URL`);
				console.log(returnData)
			},
			/* ----------------------获取豆瓣电影 end--------------- */

			toDetail (data) {
				uni.navigateTo({
					url: `/pages/answer/detail?id=${data._id}`
				})
			}
		},
		onReachBottom() {
			console.log('滑动到页面底部')
			if ((this.pageNo -1) *this.pageSize >= this.totalCount || this.dataList.length >= this.totalCount) {
				this.loadMoreText = '没有更多了'
				return;
			}
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
