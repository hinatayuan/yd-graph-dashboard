export function hexToString(hexInput: string): string {
  try {
    // 移除0x前缀（如果存在）
    const hex = hexInput.startsWith('0x') ? hexInput.slice(2) : hexInput;
    
    // 验证16进制字符串
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
      throw new Error('无效的16进制字符串');
    }
    
    // 将16进制转换为字节数组
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    
    // 解码为字符串（UTF-8）
    const decoder = new TextDecoder('utf-8');
    const result = decoder.decode(bytes);
    
    return result;
  } catch (error) {
    return `解析错误: ${error instanceof Error ? error.message : '未知错误'}`;
  }
}

export function isValidHex(hex: string): boolean {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return /^[0-9a-fA-F]+$/.test(cleanHex) && cleanHex.length % 2 === 0;
}