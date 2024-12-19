from PIL import Image
import os
import sys

def compress_image(input_path, output_path, max_size=(600, 600), quality=80):
    """
    压缩图片函数
    :param input_path: 输入图片路径
    :param output_path: 输出图片路径
    :param max_size: 最大尺寸
    :param quality: 压缩质量（1-100）
    """
    try:
        # 打开图片
        with Image.open(input_path) as img:
            # 转换为RGB模式（去除透明通道）
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # 计算新的尺寸
            width, height = img.size
            ratio = min(max_size[0]/width, max_size[1]/height)
            
            if ratio < 1:
                new_size = (int(width * ratio), int(height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # 创建输出目录（如果不存在）
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # 保存压缩后的图片
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            # 获取文件大小
            original_size = os.path.getsize(input_path) / 1024  # KB
            compressed_size = os.path.getsize(output_path) / 1024  # KB
            
            print(f"压缩完成: {os.path.basename(input_path)}")
            print(f"原始大小: {original_size:.2f}KB")
            print(f"压缩后大小: {compressed_size:.2f}KB")
            print(f"压缩率: {(1 - compressed_size/original_size) * 100:.2f}%")
            print("-" * 50)
            
    except Exception as e:
        print(f"处理图片 {input_path} 时出错: {str(e)}")

def main():
    # 设置输入和输出目录
    input_dir = "miniprogram/images/display"
    output_dir = "miniprogram/images/display/compressed"
    
    # 图片文件名映射
    image_mapping = {
        "椅子.png": "chair.jpg",
        "血压计.png": "blood_pressure.jpg",
        "旅游.png": "travel.jpg",
        "茶.png": "tea.jpg"
    }
    
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 处理每个图片
    for old_name, new_name in image_mapping.items():
        input_path = os.path.join(input_dir, old_name)
        output_path = os.path.join(output_dir, new_name)
        
        if os.path.exists(input_path):
            print(f"正在处理: {old_name}")
            compress_image(input_path, output_path)
        else:
            print(f"找不到文件: {input_path}")

if __name__ == "__main__":
    main() 