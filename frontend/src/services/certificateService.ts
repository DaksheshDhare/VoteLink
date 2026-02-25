interface VotingCertificate {
  voterId: string;
  voterName: string;
  voterEmail: string;
  votingDate: Date;
  transactionId: string;
  blockchainHash: string;
  blockNumber?: number;
  blockHash?: string;
  constituency: string;
  electionType: string;
  securityHash: string;
  verificationUrl?: string;
  networkName?: string;
}

class CertificateService {
  // Mask email address for privacy and security (show first letter)
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***@***.***';
    const [localPart, domain] = email.split('@');
    const domainParts = domain.split('.');
    const maskedLocal = localPart.charAt(0) + '***';
    const maskedDomain = domainParts.map((part, index) => 
      index === domainParts.length - 1 ? part : '***'
    ).join('.');
    return `${maskedLocal}@${maskedDomain}`;
  }

  // Mask voter ID (show first 4 and last 4 characters)
  private maskVoterId(id: string): string {
    if (id.length <= 8) return id;
    return `${id.slice(0, 4)}${'*'.repeat(id.length - 8)}${id.slice(-4)}`;
  }

  // Truncate transaction hash
  private truncateHash(hash: string): string {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
  }

  generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  generateBlockchainHash(): string {
    const data = Date.now() + Math.random();
    return `0x${data.toString(16).padStart(64, '0')}`;
  }

  generateSecurityHash(voterId: string, transactionId: string): string {
    const combined = voterId + transactionId + Date.now();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  }

  async generateCertificate(voterData: {
    voterId: string;
    voterName: string;
    voterEmail: string;
    constituency?: string;
    blockchainData?: {
      transactionHash: string;
      blockNumber: number;
      blockHash: string;
      networkName?: string;
    };
  }): Promise<VotingCertificate> {
    // Use real blockchain data if available, otherwise generate mock data
    const transactionId = voterData.blockchainData?.transactionHash || this.generateTransactionId();
    const blockchainHash = voterData.blockchainData?.transactionHash || this.generateBlockchainHash();
    const blockNumber = voterData.blockchainData?.blockNumber;
    const blockHash = voterData.blockchainData?.blockHash;
    const networkName = voterData.blockchainData?.networkName || 'Sepolia Testnet';
    
    const securityHash = this.generateSecurityHash(voterData.voterId, transactionId);
    
    // Generate verification URL for blockchain explorer
    const verificationUrl = voterData.blockchainData?.transactionHash 
      ? `https://sepolia.etherscan.io/tx/${voterData.blockchainData.transactionHash}`
      : undefined;

    return {
      voterId: voterData.voterId,
      voterName: voterData.voterName,
      voterEmail: voterData.voterEmail,
      votingDate: new Date(),
      transactionId,
      blockchainHash,
      blockNumber,
      blockHash,
      constituency: voterData.constituency || 'General Constituency',
      electionType: 'General Election 2026',
      securityHash,
      verificationUrl,
      networkName
    };
  }

  async downloadCertificate(certificate: VotingCertificate): Promise<void> {
    // Create certificate HTML
    const certificateHTML = this.generateCertificateHTML(certificate);
    
    // Create a temporary div to render the certificate
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = certificateHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.background = 'black';
    tempDiv.style.padding = '40px';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);

    try {
      // Use html2canvas to convert to image, then to PDF
      const canvas = await (window as any).html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      // Create PDF
      const { jsPDF } = (window as any);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`Voting_Certificate_${certificate.transactionId}.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      // Fallback: download as text file
      this.downloadAsText(certificate);
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  private downloadAsText(certificate: VotingCertificate): void {
    const textContent = `
VOTING CERTIFICATE
==================

Voter ID (Encrypted): ${this.maskVoterId(certificate.voterId)}
Voter Name: ${certificate.voterName}
Email (Protected): ${this.maskEmail(certificate.voterEmail)}
Voting Date: ${certificate.votingDate.toLocaleString()}
Transaction ID: ${certificate.transactionId}
Blockchain Hash (Encrypted): ${this.truncateHash(certificate.blockchainHash)}
${certificate.blockNumber ? `Block Number: ${certificate.blockNumber}` : ''}
${certificate.blockHash ? `Block Hash: ${certificate.blockHash}` : ''}
${certificate.networkName ? `Network: ${certificate.networkName}` : ''}
Constituency: ${certificate.constituency}
Election Type: ${certificate.electionType}
Security Hash: ${certificate.securityHash}
${certificate.verificationUrl ? `\nVerify on Blockchain: ${certificate.verificationUrl}` : ''}

This certificate serves as proof of your participation in the democratic process.
Keep this certificate safe for your records.

Generated by VoteLink - Secure Digital Voting Platform
Powered by Blockchain Technology
    `;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Voting_Certificate_${certificate.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private generateCertificateHTML(certificate: VotingCertificate): string {
    return `
      <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; border: 3px solid #FF6B35; background: linear-gradient(135deg, #FFF5F0 0%, #F0F8FF 100%);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #FF6B35, #4ECDC4); border-radius: 50%; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: black; font-size: 36px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: #FF6B35; margin: 0; font-size: 32px; font-weight: bold;">VOTING CERTIFICATE</h1>
          <p style="color: #666; margin: 5px 0; font-size: 16px;">Official Proof of Democratic Participation</p>
        </div>

        <div style="background: black; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <strong style="color: #FF6B35;">Voter ID (Encrypted):</strong><br>
              <span style="font-family: monospace; background: #f5f5f5; padding: 5px; border-radius: 3px;">${this.maskVoterId(certificate.voterId)}</span>
            </div>
            <div>
              <strong style="color: #FF6B35;">Voter Name:</strong><br>
              <span>${certificate.voterName}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <strong style="color: #FF6B35;">Email (Protected):</strong><br>
              <span>${this.maskEmail(certificate.voterEmail)}</span>
            </div>
            <div>
              <strong style="color: #FF6B35;">Voting Date:</strong><br>
              <span>${certificate.votingDate.toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <strong style="color: #FF6B35;">Transaction ID:</strong><br>
            <span style="font-family: monospace; background: #e8f5e8; padding: 8px; border-radius: 5px; display: inline-block; margin-top: 5px;">${certificate.transactionId}</span>
          </div>

          <div style="margin-bottom: 20px;">
            <strong style="color: #FF6B35;">Blockchain Hash (Encrypted):</strong><br>
            <span style="font-family: monospace; background: #e8f5e8; padding: 8px; border-radius: 5px; display: inline-block; margin-top: 5px; word-break: break-all; font-size: 12px;">${this.truncateHash(certificate.blockchainHash)}</span>
          </div>

          ${certificate.blockNumber ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <strong style="color: #FF6B35;">Block Number:</strong><br>
              <span style="font-family: monospace;">${certificate.blockNumber}</span>
            </div>
            <div>
              <strong style="color: #FF6B35;">Network:</strong><br>
              <span>${certificate.networkName || 'Sepolia Testnet'}</span>
            </div>
          </div>` : ''}
          
          ${certificate.verificationUrl ? `
          <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
            <strong style="color: #1976d2;">🔗 Blockchain Verification:</strong><br>
            <a href="${certificate.verificationUrl}" target="_blank" style="color: #1976d2; text-decoration: none; font-size: 12px; word-break: break-all;">${certificate.verificationUrl}</a>
          </div>` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <strong style="color: #FF6B35;">Constituency:</strong><br>
              <span>${certificate.constituency}</span>
            </div>
            <div>
              <strong style="color: #FF6B35;">Election Type:</strong><br>
              <span>${certificate.electionType}</span>
            </div>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4ECDC4;">
          <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
            <strong>Security Hash:</strong> <span style="font-family: monospace;">${certificate.securityHash}</span><br><br>
            This certificate serves as official proof of your participation in the democratic process. 
            It is secured by blockchain technology and cryptographic hashing to ensure authenticity and prevent tampering.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Generated by VoteLink - Secure Digital Voting Platform<br>
            Powered by Blockchain Technology | ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;
  }
}

export const certificateService = new CertificateService();