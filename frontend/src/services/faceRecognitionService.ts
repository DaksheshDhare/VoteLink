// Face Recognition Service using face-api.js
import * as faceapi from 'face-api.js';

interface FaceDescriptor {
  descriptor: Float32Array;
  timestamp: Date;
}

interface FaceMatchResult {
  match: boolean;
  distance: number;
  confidence: number;
  message: string;
}

class FaceRecognitionService {
  private modelsLoaded = false;
  private detectorLoaded = false;
  private readonly MODEL_URL = '/models'; // Models will be in public/models directory
  private readonly MATCH_THRESHOLD = 0.50; // Threshold set to accept 50%+ confidence
  private readonly detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 }); // Larger size and lower threshold for better detection
  private readonly idCardDetectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.05 }); // Even more lenient for ID card photos

  /**
   * Load only the tiny face detector for fast capture
   */
  async loadDetectorOnly(): Promise<void> {
    if (this.detectorLoaded) return;

    try {
      console.log('Loading face detector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL);
      this.detectorLoaded = true;
      console.log('✅ Face detector loaded');
    } catch (error) {
      console.error('❌ Failed to load face detector:', error);
      throw new Error('Failed to load face detector.');
    }
  }

  /**
   * Load face-api.js models
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      console.log('Loading face recognition models...');
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL),
      ]);

      this.modelsLoaded = true;
      this.detectorLoaded = true;
      console.log('✅ Face recognition models loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load face recognition models:', error);
      throw new Error('Failed to load face recognition models. Please check your internet connection.');
    }
  }

  /**
   * Quick face detection only (no descriptor) - for fast capture
   */
  async detectFaceQuick(imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<boolean> {
    await this.loadDetectorOnly();
    
    try {
      const detection = await faceapi.detectSingleFace(imageElement, this.detectorOptions);
      return !!detection;
    } catch (error) {
      console.error('Quick face detection error:', error);
      return false;
    }
  }

  /**
   * Detect and extract face descriptor from image
   */
  async extractFaceDescriptor(imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<Float32Array | null> {
    await this.loadModels();

    try {
      const detection = await faceapi
        .detectSingleFace(imageElement, this.detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.warn('No face detected in image');
        return null;
      }

      console.log('✅ Face detected and descriptor extracted');
      return detection.descriptor;
    } catch (error) {
      console.error('Error extracting face descriptor:', error);
      throw new Error('Failed to process face image');
    }
  }

  /**
   * Capture face from video stream
   */
  async captureFaceFromVideo(videoElement: HTMLVideoElement): Promise<Float32Array | null> {
    return this.extractFaceDescriptor(videoElement);
  }

  /**
   * Extract face from uploaded image file
   */
  async extractFaceFromFile(file: File): Promise<Float32Array | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = async (e) => {
        img.src = e.target?.result as string;
        img.onload = async () => {
          try {
            const descriptor = await this.extractFaceDescriptor(img);
            resolve(descriptor);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extract face from Voter ID image with more lenient settings for ID card photos
   */
  async extractFaceFromVoterID(voterIdImage: File): Promise<Float32Array | null> {
    console.log('Extracting face from Voter ID with enhanced detection...');
    
    try {
      await this.loadModels();
      
      // Load image
      const img = await this.loadImageFromFile(voterIdImage);
      
      // Try with standard ID card detection first (more lenient)
      console.log('Trying ID card detector settings...');
      let detection = await faceapi
        .detectSingleFace(img, this.idCardDetectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        console.log('✅ Face detected with ID card settings');
        return detection.descriptor;
      }
      
      // Fallback: Try with even larger input size
      console.log('Trying larger input size...');
      const largerOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.03 });
      detection = await faceapi
        .detectSingleFace(img, largerOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        console.log('✅ Face detected with larger input size');
        return detection.descriptor;
      }
      
      // Fallback: Try SSD MobileNet if available (better for small faces)
      console.log('Trying standard detector...');
      detection = await faceapi
        .detectSingleFace(img, this.detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        console.log('✅ Face detected with standard settings');
        return detection.descriptor;
      }
      
      console.warn('❌ No face detected in Voter ID with any settings');
      return null;
    } catch (error) {
      console.error('Failed to extract face from Voter ID:', error);
      throw error;
    }
  }

  /**
   * Load image from file as HTMLImageElement
   */
  private loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compare two face descriptors
   */
  compareFaces(descriptor1: Float32Array, descriptor2: Float32Array): FaceMatchResult {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    const match = distance < this.MATCH_THRESHOLD;
    const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));

    let message = '';
    if (match) {
      if (confidence >= 70) {
        message = 'Excellent match - Face verified successfully!';
      } else if (confidence >= 50) {
        message = 'Good match - Face verified!';
      } else {
        message = 'Face match verified (ID card photo quality may affect accuracy)';
      }
    } else {
      message = 'Face does not match. This does not appear to be the same person. Please upload YOUR Voter ID card only.';
    }

    return {
      match,
      distance,
      confidence: Math.round(confidence),
      message
    };
  }

  /**
   * Verify face against stored descriptor
   */
  async verifyFace(
    capturedDescriptor: Float32Array,
    storedDescriptor: Float32Array
  ): Promise<FaceMatchResult> {
    console.log('Verifying face match...');
    const result = this.compareFaces(capturedDescriptor, storedDescriptor);
    console.log(`Match result: ${result.match ? '✅ MATCH' : '❌ NO MATCH'} (${result.confidence}% confidence)`);
    return result;
  }

  /**
   * Convert descriptor to storable format (JSON)
   */
  descriptorToJSON(descriptor: Float32Array): string {
    return JSON.stringify(Array.from(descriptor));
  }

  /**
   * Convert JSON back to Float32Array descriptor
   */
  JSONToDescriptor(json: string): Float32Array {
    return new Float32Array(JSON.parse(json));
  }

  /**
   * Validate image quality for face recognition
   */
  async validateImageQuality(imageElement: HTMLImageElement | HTMLVideoElement): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    await this.loadModels();

    const issues: string[] = [];

    // Very lenient - just check if face can be detected
    const detection = await faceapi
      .detectSingleFace(imageElement, this.detectorOptions)
      .withFaceLandmarks();

    if (!detection) {
      issues.push('No face detected in image');
      return { valid: false, issues };
    }

    // Accept any face size - no strict validation
    return {
      valid: true,
      issues
    };
  }

  /**
   * Get multiple face descriptors for better accuracy
   */
  async captureMultipleFaces(videoElement: HTMLVideoElement, count: number = 3): Promise<Float32Array[]> {
    const descriptors: Float32Array[] = [];
    
    for (let i = 0; i < count; i++) {
      const descriptor = await this.captureFaceFromVideo(videoElement);
      if (descriptor) {
        descriptors.push(descriptor);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between captures
      }
    }

    return descriptors;
  }

  /**
   * Get average descriptor from multiple captures
   */
  getAverageDescriptor(descriptors: Float32Array[]): Float32Array {
    if (descriptors.length === 0) {
      throw new Error('No descriptors provided');
    }

    if (descriptors.length === 1) {
      return descriptors[0];
    }

    const length = descriptors[0].length;
    const average = new Float32Array(length);

    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (const descriptor of descriptors) {
        sum += descriptor[i];
      }
      average[i] = sum / descriptors.length;
    }

    return average;
  }
}

export const faceRecognitionService = new FaceRecognitionService();
export type { FaceDescriptor, FaceMatchResult };
