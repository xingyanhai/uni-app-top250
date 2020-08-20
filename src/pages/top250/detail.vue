<template>
	<view class="new-page">
		<video :src="currentUrl"></video>
	</view>
</template>

<script>
	import * as api from '../../api/api'
	import * as util from '../../common/util'
	export default {
		data() {
			return {
				movieId: '',
				movieName: '',
				movieData: {},
				urlList: '',
				currentUrl: ''
			}
		},
		computed: {
		},
		onReachBottom() {
			// console.log('滑动到页面底部')
			// if (!this.nextPageUrl) {
			// 	this.loadMoreText = '已经到底啦'
			// 	return;
			// }
			// this.getData()
		},

		methods: {
			async getData() {
				uni.showLoading({
					title: '视频加载中，请耐心等待'
				})
				let res = await wx.cloud.callFunction({
					name: 'getSearchVideo',
					data: {
						search: this.movieName,
						movieId: this.movieId
					}
				})
				uni.hideLoading()
				if(res.errMsg === 'cloud.callFunction:ok') {
					let data = res.result
					if(data && data.videoName) {
						this.movieData = data || {}
						this.urlList = data.urlList
						if(this.urlList && this.urlList.length) {
							this.currentUrl = this.urlList[0].value
						}
					} else {
						this.noData = true
						uni.showToast({
							title: `抱歉，暂无视频播放源!`,
							icon: 'none',
						})
					}
				} else {
					console.log('error')
				}
			},
		},
		// 加了这个页面才可以被分享
		onShareAppMessage () {
		},
		async onLoad(data) {
			this.movieName = data.name
			this.movieId = data.movieId
			this.getData()
			uni.setNavigationBarTitle({
				title: data.name
			});
		},
	}
</script>

<style scoped lang="stylus">
@import "../../uni.styl"
.new-page
	display block
	width 100%
.head-area
	padding-top: 70px;
	display flex
	flex-direction column
	align-items center
	width 100%
	color white
	background-color $uni-color-primary
	padding-bottom 10px
	.name
		font-weight bold
		font-size 30px
		line-height 50px
	.tip
		font-size 14px
		line-height 20px
	.count
		font-size 12px
		line-height 20px
.first-image-box
	display flex
	width 100%
	position relative
	.first-image
		width 100%
		box-sizing border-box
		padding 0 1px
	.new
		position absolute
		right 0
		top 0
		font-size 12px
		padding 10px
		color #fff
.list-box
	width 100%
	display flex
	flex-wrap wrap
	box-sizing border-box
	padding 1px 0
	.list-item
		&:nth-child(2n)
			.img
				padding-right 0
		width 50%
		height calc(100vh / 2)
		.img
			box-sizing border-box
			width 100%
			height 100%
			padding 0 1px 1px 0
			display block

</style>
