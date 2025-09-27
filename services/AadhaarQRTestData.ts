/**
 * Aadhaar QR Test Data Generator
 * 
 * This file contains sample Aadhaar QR code data in various formats
 * for testing and development purposes.
 */

export interface AadhaarTestData {
  uid: string;
  name: string;
  gender: string;
  yob: string;
  co: string;
  vtc: string;
  po: string;
  dist: string;
  state: string;
  pc: string;
}

export class AadhaarQRTestDataGenerator {
  /**
   * Generate mAadhaar app JSON format QR data
   */
  static generateMAadhaarJSON(): string {
    const testData: AadhaarTestData = {
      uid: "123456789012",
      name: "JOHN DOE",
      gender: "M",
      yob: "1990",
      co: "123 Main Street",
      vtc: "Sample Village",
      po: "Sample Post Office",
      dist: "Sample District",
      state: "Sample State",
      pc: "123456"
    };

    return JSON.stringify(testData);
  }

  /**
   * Generate UIDAI PDF base64 encoded QR data
   */
  static generateUIDAIPDFBase64(): string {
    const testData: AadhaarTestData = {
      uid: "987654321098",
      name: "JANE SMITH",
      gender: "F",
      yob: "1985",
      co: "456 Oak Avenue",
      vtc: "Test Village",
      po: "Test Post Office",
      dist: "Test District",
      state: "Test State",
      pc: "654321"
    };

    const jsonData = JSON.stringify(testData);
    return btoa(jsonData);
  }

  /**
   * Generate XML format QR data
   */
  static generateXMLFormat(): string {
    const testData: AadhaarTestData = {
      uid: "111111111111",
      name: "ALICE JOHNSON",
      gender: "F",
      yob: "1992",
      co: "789 Pine Street",
      vtc: "XML Village",
      po: "XML Post Office",
      dist: "XML District",
      state: "XML State",
      pc: "111111"
    };

    return `<aadhaar>
      <uid>${testData.uid}</uid>
      <name>${testData.name}</name>
      <gender>${testData.gender}</gender>
      <yob>${testData.yob}</yob>
      <co>${testData.co}</co>
      <vtc>${testData.vtc}</vtc>
      <po>${testData.po}</po>
      <dist>${testData.dist}</dist>
      <state>${testData.state}</state>
      <pc>${testData.pc}</pc>
    </aadhaar>`;
  }

  /**
   * Generate raw format QR data (key-value pairs)
   */
  static generateRawFormat(): string {
    const testData: AadhaarTestData = {
      uid: "222222222222",
      name: "BOB WILSON",
      gender: "M",
      yob: "1988",
      co: "321 Elm Street",
      vtc: "Raw Village",
      po: "Raw Post Office",
      dist: "Raw District",
      state: "Raw State",
      pc: "222222"
    };

    return `uid:${testData.uid},name:${testData.name},gender:${testData.gender},yob:${testData.yob},co:${testData.co},vtc:${testData.vtc},po:${testData.po},dist:${testData.dist},state:${testData.state},pc:${testData.pc}`;
  }

  /**
   * Get all test data formats
   */
  static getAllTestFormats(): { format: string; data: string; description: string }[] {
    return [
      {
        format: "mAadhaar JSON",
        data: this.generateMAadhaarJSON(),
        description: "Standard mAadhaar app QR code format"
      },
      {
        format: "UIDAI PDF Base64",
        data: this.generateUIDAIPDFBase64(),
        description: "UIDAI PDF QR code (base64 encoded)"
      },
      {
        format: "XML Format",
        data: this.generateXMLFormat(),
        description: "XML format Aadhaar data"
      },
      {
        format: "Raw Format",
        data: this.generateRawFormat(),
        description: "Raw key-value format"
      }
    ];
  }
}
