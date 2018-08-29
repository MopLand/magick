# Magick

> 使用 XMLHttpRequest  处理图片上传

- 使用 Canvas 来进行前端图片压缩
- 使用 pack.exif.js 来支持自动旋转方向

## 使用方法

### HTML

	<input type="file" name="fileobj" />

### JavaScript

#### 依赖 Ray.js

	<script type="text/javascript" src="//public.zhfile.com/js/ray.js"></script>
	<script type="text/javascript" src="//public.zhfile.com/js/pack.magick.js"></script>
	<script type="text/javascript" src="//public.zhfile.com/js/pack.hybrid.css"></script>

#### 基本示例

	//处理进程
	var fn = function( e ){
		
		//压缩图片
		console.log( '正在压缩图片' );

		//对图片进行预处理
		Magick.parser( e, { width : 200, height : 200, hrange : 'center', vrange : 'center', unit : 'px' },{

			//文件类型出错时回调
			error : function( type, msg ){
				console.log( '错误类型：'+ type +'，错误信息：'+ msg );
			},

			//文件校验通过时回调
			valid : function( data, image, filename ){
				
				//压缩图片
				console.log( '图片压缩完成', 'success', 5 );
				
				//执行图片上传操作
				Magick.upload( data, 'upload.php', { filename : filename, formdata : { 'token' : '...' } }, {
					
					//上传完成回调
					success : function( response ){
						console.log( '图片上传完成', 'success', 5 );
						console.log( JSON.parse( response ) );
					},

					//上传失败回调
					failure : function( response ){
						console.log( 'invalid', '上传失败：'+ response, {'time': 3, 'unique': 'toast'});
					},
					
					//上传过程回调
					progress : function( percentage ){
						console.log( '上传进度：'+ percentage +'%' );
					}
					
				} );
			}
			
		});
	
	};

	//绑定事件
	document.querySelector('[type=file]').addEventListener('change', fn, false);

## 上传接口

### 接收参数

	[files]			上传文件流
	[formdata]		其他来自 formdata 的数据

### 响应类型
	Content-Type:text/html

### 上传完成

	{"return":0,"file":"./upload/example.png","name":"example.png","type":"image\/png","size":293001}

### 上传错误

	{"return":-1000,"result":"文件类型不支持"}

## 高级选项

### 自动调整图片方向

	<script type="text/javascript" src="//public.zhfile.com/js/pack.exif.js"></script>

### 对图片进行预处理

	// 对图片进行预处理，根据宽度和高度进行裁切
	Magick.parser( e, { width : 200, height : 200 },{
	 
		// 文件类型出错时回调
		error : function( data ){
			alert( '错误的文件类型：'+ data );
		},
		
		// 文件校验通过时回调
		valid : function( data, image ){
			
			// 执行图片上传操作
			Magick.upload( data, 'upload.php', {}, {
				
			} );
		}
	
	});
	 
	// 根据宽度，对图片进行缩放处理
	Magick.parser( e, { width : 800 },{

	});
	 
	// 根据高度，对图片进行缩放处理
	Magick.parser( e, { height : 600 },{

	});
	
	// 根据宽度比例，对图片进行缩放处理
	Magick.parser( e, { width : 80, unit : '%' },{
	
	});
	
	// 当图片需要裁切时，水平偏移量：center | right | left
	Magick.parser( e, { hrange : 'center' },{
	
	});
	
	// 当图片需要裁切时，垂直偏移量：center | bottom | top
	Magick.parser( e, { vrange : 'center' },{
	
	});
	
	// 对图片宽度进行限定，超过尺寸时将自动缩放
	Magick.parser( e, { maxwidth : 800 },{
	
	});
	
	// 对图片高度进行限定，超过尺寸时将自动缩放
	Magick.parser( e, { maxheight : 600 },{
	
	});
	
	// 导出图片质量 50，可以控制压缩大小
	Magick.parser( e, { quality : 50 },{
	
	});
	
	// 导出图片格式，默认使用当前格式
	Magick.parser( e, { output : 'png' },{
	
	});
	
	// 限定上传的文件大小（bytes）
	Magick.parser( e, { maximum : 1024 },{
	
	});
	
	// 启用兼容模式，部分 Android WebView 获取到的 data(.+?)base64 为空
	Magick.parser( e, { compat : true },{
	
	});

### 上传时可使用的参数
	
	// 指定上传的文件域名称，默认使用 file
	Magick.upload( data, 'upload.php', { inputname : 'filex' }, {
	
	});
	
	// 上传时附加更多的数据
	Magick.upload( data, 'upload.php', { formdata : { 'x' : 'y' }, {
	
	});
	
	// 指定上传的文件名称
	Magick.upload( data, 'upload.php', { filename : 'filename.png' }, {
	
	});

### 支持文件拖拽上传

	var doc = document.body;
	
	// 将文件拖离
	doc.addEventListener('dragleave', function( e ) {
		e.preventDefault();
	}, false);
	
	// 文件拖动中
	doc.addEventListener('dragover', function( e ) {
		e.preventDefault();
	}, false);
	
	// 将文件释放
	doc.addEventListener('drop', function( e ) {
		e.preventDefault();
		console.log( e.dataTransfer.files );
		fn( e );
	}, false);

## DOC 生成

	jsdoc pack.magic.js -d doc