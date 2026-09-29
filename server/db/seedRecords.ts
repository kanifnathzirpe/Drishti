import {
  DocumentRecord,
  ExtractedRecord,
  ValidationResult,
  AuditLog,
  GisParcel,
  NotificationItem,
  LrmsSyncRecord,
  FeedbackRecord,
} from '../types.js';

export function generateSeedDocumentsAndRecords() {
  const now = new Date().toISOString();
  const documents: DocumentRecord[] = [];
  const extractedRecords: ExtractedRecord[] = [];
  const validationResults: ValidationResult[] = [];
  const gisParcels: GisParcel[] = [];
  const auditLogs: AuditLog[] = [];
  const notifications: NotificationItem[] = [];
  const lrmsSyncRecords: LrmsSyncRecord[] = [];
  const feedbackRecords: FeedbackRecord[] = [];

  // Realistic sample document fixtures
  const sampleData = [
    {
      docId: 'DOC-MH-2026-001',
      fileName: 'Wagholi_Survey_142_RoR_7_12.svg',
      village: 'Wagholi',
      tehsil: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      surveyNo: '142',
      khasraNo: '142/1',
      khataNo: '884',
      docType: 'Record of Rights' as const,
      lang: 'Marathi',
      owner: 'Balasaheb Tukaram Jagtap',
      relative: 'Tukaram Govind Jagtap',
      share: 100,
      area: 2.45,
      unit: 'Acre',
      landClass: 'Agricultural (Jirayat)',
      status: 'APPROVED' as const,
      workflow: 'APPROVED' as const,
      confidence: 96,
      quality: 92,
      lat: 18.5793,
      lng: 73.9814,
      sync: 'SYNCED' as const,
    },
    {
      docId: 'DOC-MH-2026-002',
      fileName: 'Wagholi_Survey_188_Joint_RoR.svg',
      village: 'Wagholi',
      tehsil: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      surveyNo: '188/2',
      khasraNo: '188/2B',
      khataNo: '1029',
      docType: 'Record of Rights' as const,
      lang: 'Marathi',
      owner: 'Ganesh Dattatray Shinde',
      relative: 'Dattatray Shinde',
      share: 50,
      coOwner: 'Suresh Dattatray Shinde',
      coShare: 50,
      area: 3.8,
      unit: 'Acre',
      landClass: 'Agricultural (Bagayat - Well Irrigated)',
      status: 'REVIEW_REQUIRED' as const,
      workflow: 'IN_REVIEW' as const,
      confidence: 72,
      quality: 68,
      lat: 18.5832,
      lng: 73.9865,
      sync: 'NOT_SYNCED' as const,
      priority: 'HIGH' as const,
      issue: 'Ambiguous handwritten co-owner share ratio in Ferfar annotation',
    },
    {
      docId: 'DOC-MH-2026-003',
      fileName: 'Koregaon_Mutation_Ferfar_4402.png',
      village: 'Koregaon Bhima',
      tehsil: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      surveyNo: '95/4',
      khasraNo: '95/4',
      khataNo: '312',
      docType: 'Mutation Register' as const,
      lang: 'Marathi',
      owner: 'Chandrakant Marutirao Pawar',
      relative: 'Marutirao Pawar',
      share: 100,
      area: 1.15,
      unit: 'Hectare',
      landClass: 'Agricultural',
      status: 'SYNCED' as const,
      workflow: 'APPROVED' as const,
      confidence: 94,
      quality: 89,
      lat: 18.654,
      lng: 74.072,
      sync: 'SYNCED' as const,
    },
    {
      docId: 'DOC-MH-2026-004',
      fileName: 'Shindewadi_SaleDeed_Reg_8819.png',
      village: 'Shindewadi',
      tehsil: 'Karad',
      district: 'Satara',
      state: 'Maharashtra',
      surveyNo: '304/A',
      khasraNo: '304/A-1',
      khataNo: '540',
      docType: 'Sale Deed' as const,
      lang: 'English',
      owner: 'Nirmala Vasant Kadam',
      relative: 'Vasant Kadam',
      share: 100,
      area: 0.75,
      unit: 'Acre',
      landClass: 'Non-Agricultural (Commercial)',
      status: 'APPROVED' as const,
      workflow: 'APPROVED' as const,
      confidence: 98,
      quality: 95,
      lat: 17.289,
      lng: 74.182,
      sync: 'SYNCED' as const,
    },
    {
      docId: 'DOC-UP-2026-005',
      fileName: 'Rampur_Khasra_Khatauni_109.png',
      village: 'Rampur',
      tehsil: 'Bakshi Ka Talab',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      surveyNo: '214',
      khasraNo: '214-Ka',
      khataNo: '44',
      docType: 'Land Register' as const,
      lang: 'Hindi',
      owner: 'Ram Prasad Tiwari',
      relative: 'Harishankar Tiwari',
      share: 100,
      area: 4.2,
      unit: 'Bigha',
      landClass: 'Agricultural',
      status: 'REVIEW_REQUIRED' as const,
      workflow: 'IN_REVIEW' as const,
      confidence: 68,
      quality: 55,
      lat: 26.974,
      lng: 80.925,
      sync: 'NOT_SYNCED' as const,
      priority: 'HIGH' as const,
      issue: 'Blurry stamp obscuring Khasra subdivision 214-Ka and Fasli year',
    },
    {
      docId: 'DOC-MH-2026-006',
      fileName: 'Wagholi_Survey_142_Duplicate_Scan.png',
      village: 'Wagholi',
      tehsil: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      surveyNo: '142',
      khasraNo: '142/1',
      khataNo: '884',
      docType: 'Record of Rights' as const,
      lang: 'Marathi',
      owner: 'Balasaheb Tukaram Jagtap',
      relative: 'Tukaram Govind Jagtap',
      share: 100,
      area: 2.45,
      unit: 'Acre',
      landClass: 'Agricultural',
      status: 'REJECTED' as const,
      workflow: 'REJECTED' as const,
      confidence: 91,
      quality: 90,
      lat: 18.5793,
      lng: 73.9814,
      sync: 'NOT_SYNCED' as const,
      duplicate: true,
      duplicateOf: 'DOC-MH-2026-001',
      rejectionReason: 'Duplicate upload detected. Identical parcel and owner already approved.',
    },
  ];

  // Populate first 6 curated demo fixtures
  sampleData.forEach((s) => {
    const doc: DocumentRecord = {
      id: s.docId,
      batchId: s.village === 'Wagholi' ? 'BATCH-2026-001' : s.village === 'Koregaon Bhima' ? 'BATCH-2026-002' : 'BATCH-2026-003',
      fileName: s.fileName,
      fileUrl: `/samples/${s.fileName}`,
      fileType: 'image/png',
      fileSize: 1024 * 1024 * 1.8,
      fileHash: `hash-${s.docId.toLowerCase()}-e26018`,
      pageCount: 1,
      state: s.state,
      district: s.district,
      tehsil: s.tehsil,
      village: s.village,
      documentType: s.docType,
      language: s.lang,
      uploadStatus: 'SUCCESS',
      processingStatus: s.status,
      qualityScore: s.quality,
      overallConfidence: s.confidence,
      workflowStatus: s.workflow,
      priority: s.priority || 'NORMAL',
      uploadedBy: 'usr-op-01',
      uploadedByName: 'Ramesh Patil',
      assignedTo: s.status === 'REVIEW_REQUIRED' ? 'usr-ver-01' : undefined,
      assignedToName: s.status === 'REVIEW_REQUIRED' ? 'Sunita Deshmukh' : undefined,
      assignedAt: s.status === 'REVIEW_REQUIRED' ? '2026-09-27T10:00:00.000Z' : undefined,
      slaDueDate: s.status === 'REVIEW_REQUIRED' ? '2026-09-30T17:00:00.000Z' : undefined,
      lrmsSyncStatus: s.sync,
      lrmsRecordId: s.sync === 'SYNCED' ? `DILRMP-${s.state.substring(0, 2).toUpperCase()}-${s.surveyNo}-2026` : undefined,
      lrmsSyncedAt: s.sync === 'SYNCED' ? '2026-09-28T16:30:00.000Z' : undefined,
      duplicateStatus: s.duplicate ? 'HIGH_CONFIDENCE_DUPLICATE' : 'NO_MATCH',
      duplicateOfDocId: s.duplicateOf,
      duplicateDetails: s.duplicate ? `Exact duplicate of record #${s.duplicateOf}` : undefined,
      rejectionReason: s.rejectionReason,
      createdAt: '2026-09-26T09:00:00.000Z',
      updatedAt: now,
      isDemo: true,
    };
    documents.push(doc);

    // Extracted Record
    const ext: ExtractedRecord = {
      id: `EXT-${s.docId}`,
      documentId: s.docId,
      location: {
        state: { value: s.state, confidence: 99, sourcePage: 1, boundingBox: [60, 80, 110, 400] },
        district: { value: s.district, confidence: 98, sourcePage: 1, boundingBox: [115, 80, 160, 400] },
        tehsil: { value: s.tehsil, confidence: 97, sourcePage: 1, boundingBox: [165, 80, 210, 400] },
        village: { value: s.village, confidence: 98, sourcePage: 1, boundingBox: [215, 80, 260, 400] },
        lgdStateCode: { value: '27', confidence: 99, sourcePage: 1 },
        lgdDistrictCode: { value: '521', confidence: 99, sourcePage: 1 },
        lgdVillageCode: { value: '556102', confidence: 95, sourcePage: 1 },
      },
      parcel: {
        surveyNumber: { value: s.surveyNo, confidence: s.confidence >= 90 ? 98 : 74, sourcePage: 1, boundingBox: [280, 100, 340, 320] as [number, number, number, number] },
        khasraNumber: { value: s.khasraNo, confidence: 96, sourcePage: 1, boundingBox: [280, 330, 340, 550] as [number, number, number, number] },
        khataNumber: { value: s.khataNo, confidence: 95, sourcePage: 1, boundingBox: [280, 560, 340, 750] as [number, number, number, number] },
        subDivision: { value: s.surveyNo.includes('/') ? s.surveyNo.split('/')[1] : '1', confidence: 92, sourcePage: 1 },
        plotArea: { value: s.area, confidence: 96, sourcePage: 1, boundingBox: [360, 100, 420, 300] as [number, number, number, number] },
        areaUnit: { value: s.unit, confidence: 98, sourcePage: 1, boundingBox: [360, 310, 420, 500] as [number, number, number, number] },
        normalizedAreaAcres: { value: s.unit === 'Hectare' ? +(s.area * 2.47105).toFixed(2) : s.unit === 'Bigha' ? +(s.area * 0.62).toFixed(2) : s.area, confidence: 98 },
      },
      ownership: {
        owners: [
          {
            id: 'own-01',
            name: { value: s.owner, confidence: s.confidence >= 90 ? 98 : 70, sourcePage: 1, boundingBox: [450, 100, 520, 450] as [number, number, number, number] },
            fatherOrHusbandName: { value: s.relative, confidence: 94, sourcePage: 1, boundingBox: [450, 460, 520, 800] as [number, number, number, number] },
            sharePercentage: { value: s.share, confidence: s.confidence >= 90 ? 99 : 65, sourcePage: 1, boundingBox: [530, 100, 580, 250] as [number, number, number, number] },
            ownershipType: { value: s.coOwner ? 'Joint Occupant Class 1' : 'Individual Occupant Class 1', confidence: 95, sourcePage: 1 },
          },
          ...(s.coOwner
            ? [
                {
                  id: 'own-02',
                  name: { value: s.coOwner, confidence: 75, sourcePage: 1, boundingBox: [590, 100, 660, 450] as [number, number, number, number] },
                  fatherOrHusbandName: { value: s.relative, confidence: 92, sourcePage: 1, boundingBox: [590, 460, 660, 800] as [number, number, number, number] },
                  sharePercentage: { value: s.coShare || 50, confidence: 72, sourcePage: 1, boundingBox: [670, 100, 720, 250] as [number, number, number, number] },
                  ownershipType: { value: 'Joint Occupant Class 1', confidence: 95, sourcePage: 1 },
                },
              ]
            : []),
        ],
        totalSharePercentage: 100,
      },
      land: {
        landClassification: { value: s.landClass, confidence: 92, sourcePage: 1, boundingBox: [740, 100, 800, 500] as [number, number, number, number] },
        landUse: { value: 'Cultivation', confidence: 95, sourcePage: 1 },
        irrigationSource: { value: s.landClass.includes('Well') ? 'Well' : 'Rainfed', confidence: 90, sourcePage: 1 },
        cropType: { value: 'Sugarcane & Jowar', confidence: 88, sourcePage: 1 },
      },
      mutation: {
        mutationNumber: { value: '4402', confidence: 95, sourcePage: 1 },
        mutationDate: { value: '2024-03-15', confidence: 94, sourcePage: 1 },
        mutationType: { value: 'Succession (Varas Nond)', confidence: 96, sourcePage: 1 },
        previousOwner: { value: s.relative, confidence: 93, sourcePage: 1 },
        newOwner: { value: s.owner, confidence: 95, sourcePage: 1 },
      },
      registration: {
        registrationNumber: { value: 'REG-2024-8819', confidence: 96, sourcePage: 1 },
        registrationDate: { value: '2024-03-18', confidence: 95, sourcePage: 1 },
        subRegistrarOffice: { value: `${s.tehsil} Joint Sub-Registrar II`, confidence: 94, sourcePage: 1 },
        deedType: { value: s.docType, confidence: 97, sourcePage: 1 },
      },
      metadata: {
        sourceFile: s.fileName,
        pageCount: 1,
        language: s.lang,
        documentType: s.docType,
        isHandwritten: s.confidence < 85,
        hasStamp: true,
        extractedAt: '2026-09-26T09:05:00.000Z',
      },
    };
    extractedRecords.push(ext);

    // Validation Results
    if (s.issue) {
      validationResults.push({
        id: `VAL-${s.docId}-01`,
        documentId: s.docId,
        ruleId: 'RULE-07',
        ruleName: 'Owner Share Range & Clarity',
        severity: 'WARNING',
        field: 'ownership.sharePercentage',
        message: s.issue,
        expected: 'Clear ratio legible in revenue register',
        actual: 'Ambiguous fraction handwritten in margin',
        status: 'FAIL',
        createdAt: now,
      });
    }

    // GIS Parcel
    gisParcels.push({
      id: `PARCEL-${s.docId}`,
      surveyNumber: s.surveyNo,
      khasraNumber: s.khasraNo,
      khataNumber: s.khataNo,
      village: s.village,
      tehsil: s.tehsil,
      district: s.district,
      state: s.state,
      ownerName: s.owner,
      plotAreaAcres: s.area,
      landClassification: s.landClass,
      status: s.sync === 'SYNCED' ? 'SYNCED' : s.status === 'REVIEW_REQUIRED' ? 'PENDING_VERIFICATION' : 'DIGITIZED',
      confidence: s.confidence,
      documentId: s.docId,
      centroid: [s.lat, s.lng],
      coordinates: [
        [s.lat - 0.0015, s.lng - 0.002],
        [s.lat + 0.0018, s.lng - 0.001],
        [s.lat + 0.0012, s.lng + 0.0022],
        [s.lat - 0.0016, s.lng + 0.0015],
      ],
    });

    if (s.sync === 'SYNCED') {
      lrmsSyncRecords.push({
        id: `SYNC-${s.docId}`,
        documentId: s.docId,
        system: 'DILRMP',
        endpoint: 'https://dilrmp.nic.in/api/v2/records',
        requestPayload: { surveyNo: s.surveyNo, owner: s.owner, areaAcres: s.area, village: s.village },
        responsePayload: { status: 'SUCCESS', ackId: `ACK-NIC-${s.surveyNo}-2026`, timestamp: now },
        status: 'SYNCED',
        attempts: 1,
        lastAttemptAt: '2026-09-28T16:30:00.000Z',
        externalRecordId: `DILRMP-${s.surveyNo}-2026`,
        syncedBy: 'usr-ver-01',
        createdAt: '2026-09-28T16:29:45.000Z',
      });
    }
  });

  // Generate 95 more diverse documents to exceed 100+ documents requirement
  const villageList = [
    { village: 'Wagholi', tehsil: 'Haveli', district: 'Pune', state: 'Maharashtra', lat: 18.579, lng: 73.981 },
    { village: 'Koregaon Bhima', tehsil: 'Haveli', district: 'Pune', state: 'Maharashtra', lat: 18.654, lng: 74.072 },
    { village: 'Shindewadi', tehsil: 'Karad', district: 'Satara', state: 'Maharashtra', lat: 17.289, lng: 74.182 },
    { village: 'Niphad', tehsil: 'Niphad', district: 'Nashik', state: 'Maharashtra', lat: 20.078, lng: 74.113 },
    { village: 'Sanwer', tehsil: 'Sanwer', district: 'Indore', state: 'Madhya Pradesh', lat: 22.978, lng: 75.829 },
    { village: 'Rampur', tehsil: 'Bakshi Ka Talab', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.974, lng: 80.925 },
  ];

  const docTypes = ['Record of Rights', 'Mutation Register', 'Sale Deed', 'Land Register', 'Cadastral Map'] as const;
  const ownerPool = [
    { name: 'Shivaji Rao Pawar', father: 'Raoji Pawar' },
    { name: 'Sambhaji Baburao Bhosale', father: 'Baburao Bhosale' },
    { name: 'Anandrao Dinkar Gaikwad', father: 'Dinkar Gaikwad' },
    { name: 'Manda Vitthal Salunkhe', father: 'Vitthal Salunkhe' },
    { name: 'Pandurang Mahadev Thorat', father: 'Mahadev Thorat' },
    { name: 'Vandana Sudhakar Sawant', father: 'Sudhakar Sawant' },
    { name: 'Santosh Janardan More', father: 'Janardan More' },
    { name: 'Radha Mohanlal Sharma', father: 'Mohanlal Sharma' },
    { name: 'Babulal Chhaganlal Verma', father: 'Chhaganlal Verma' },
    { name: 'Virendra Pratap Singh', father: 'Gajendra Singh' },
    { name: 'Kamala Devi Yadav', father: 'Ram Naresh Yadav' },
    { name: 'Dattatray Bhaurao Patil', father: 'Bhaurao Patil' },
  ];

  for (let i = 7; i <= 104; i++) {
    const v = villageList[i % villageList.length];
    const op = ownerPool[i % ownerPool.length];
    const docType = docTypes[i % docTypes.length];
    const survey = `${100 + (i % 250)}/${(i % 5) + 1}`;
    const khasra = `${100 + (i % 250)}/${(i % 5) + 1}A`;
    const khata = `${500 + i}`;
    const area = +((i % 7) * 0.85 + 0.45).toFixed(2);
    const docId = `DOC-GEN-2026-${String(i).padStart(4, '0')}`;
    const isApproved = i % 3 === 0 || i % 7 === 0;
    const isReview = !isApproved && i % 4 !== 0;
    const isFailed = !isApproved && !isReview;
    const confidence = isApproved ? 90 + (i % 9) : isReview ? 68 + (i % 18) : 42;
    const quality = isApproved ? 85 + (i % 14) : isReview ? 65 + (i % 15) : 38;
    const status = isApproved ? (i % 5 === 0 ? 'SYNCED' : 'APPROVED') : isReview ? 'REVIEW_REQUIRED' : 'FAILED';
    const workflow = isApproved ? 'APPROVED' : isReview ? 'IN_REVIEW' : 'PENDING';
    const lang = v.state === 'Maharashtra' ? 'Marathi' : v.state === 'Uttar Pradesh' ? 'Hindi' : 'English';

    documents.push({
      id: docId,
      batchId: i < 30 ? 'BATCH-2026-001' : i < 60 ? 'BATCH-2026-002' : i < 85 ? 'BATCH-2026-003' : 'BATCH-2026-004',
      fileName: `${v.village}_Survey_${survey.replace('/', '_')}_${docType.replace(/\s+/g, '_')}.svg`,
      fileUrl: `/samples/document_template.svg`,
      fileType: 'image/svg+xml',
      fileSize: 1024 * 800 + i * 4200,
      fileHash: `hash-gen-${docId.toLowerCase()}`,
      pageCount: 1,
      state: v.state,
      district: v.district,
      tehsil: v.tehsil,
      village: v.village,
      documentType: docType,
      language: lang,
      uploadStatus: 'SUCCESS',
      processingStatus: status,
      qualityScore: quality,
      overallConfidence: confidence,
      workflowStatus: workflow,
      priority: isReview && confidence < 75 ? 'HIGH' : 'NORMAL',
      uploadedBy: 'usr-op-01',
      uploadedByName: 'Ramesh Patil',
      assignedTo: isReview ? 'usr-ver-01' : undefined,
      assignedToName: isReview ? 'Sunita Deshmukh' : undefined,
      assignedAt: isReview ? '2026-09-28T09:00:00.000Z' : undefined,
      slaDueDate: isReview ? '2026-10-02T18:00:00.000Z' : undefined,
      slaBreached: isReview && i % 11 === 0,
      lrmsSyncStatus: status === 'SYNCED' ? 'SYNCED' : 'NOT_SYNCED',
      lrmsRecordId: status === 'SYNCED' ? `DILRMP-${survey.replace('/', '_')}-2026` : undefined,
      lrmsSyncedAt: status === 'SYNCED' ? '2026-09-28T18:00:00.000Z' : undefined,
      createdAt: new Date(Date.now() - (105 - i) * 3600 * 1000 * 6).toISOString(),
      updatedAt: now,
      isDemo: true,
    });

    // Extracted Record for first 55
    if (i <= 55) {
      extractedRecords.push({
        id: `EXT-${docId}`,
        documentId: docId,
        location: {
          state: { value: v.state, confidence: 99, sourcePage: 1 },
          district: { value: v.district, confidence: 98, sourcePage: 1 },
          tehsil: { value: v.tehsil, confidence: 97, sourcePage: 1 },
          village: { value: v.village, confidence: 96, sourcePage: 1 },
        },
        parcel: {
          surveyNumber: { value: survey, confidence, sourcePage: 1, boundingBox: [280, 100, 340, 320] as [number, number, number, number] },
          khasraNumber: { value: khasra, confidence: 95, sourcePage: 1 },
          khataNumber: { value: khata, confidence: 94, sourcePage: 1 },
          subDivision: { value: survey.split('/')[1] || '1', confidence: 95 },
          plotArea: { value: area, confidence: 95, sourcePage: 1, boundingBox: [360, 100, 420, 300] as [number, number, number, number] },
          areaUnit: { value: 'Acre', confidence: 98 },
          normalizedAreaAcres: { value: area, confidence: 98 },
        },
        ownership: {
          owners: [
            {
              id: `own-${docId}-1`,
              name: { value: op.name, confidence, sourcePage: 1, boundingBox: [450, 100, 520, 450] as [number, number, number, number] },
              fatherOrHusbandName: { value: op.father, confidence: 92, sourcePage: 1 },
              sharePercentage: { value: 100, confidence: 95 },
              ownershipType: { value: 'Occupant Class 1', confidence: 95 },
            },
          ],
          totalSharePercentage: 100,
        },
        land: {
          landClassification: { value: 'Agricultural (Jirayat)', confidence: 90, sourcePage: 1 },
          landUse: { value: 'Dry Crop', confidence: 92 },
          irrigationSource: { value: 'Rainfed', confidence: 88 },
          cropType: { value: 'Jowar / Bajra', confidence: 87 },
        },
        metadata: {
          sourceFile: `${v.village}_Survey_${survey.replace('/', '_')}.png`,
          pageCount: 1,
          language: lang,
          documentType: docType,
          extractedAt: now,
        },
      });

      // Cadastral Parcel
      const dLat = (i % 9) * 0.003 - 0.012;
      const dLng = (i % 7) * 0.003 - 0.009;
      const plat = v.lat + dLat;
      const plng = v.lng + dLng;
      gisParcels.push({
        id: `PARCEL-${docId}`,
        surveyNumber: survey,
        khasraNumber: khasra,
        khataNumber: khata,
        village: v.village,
        tehsil: v.tehsil,
        district: v.district,
        state: v.state,
        ownerName: op.name,
        plotAreaAcres: area,
        landClassification: 'Agricultural (Jirayat)',
        status: status === 'SYNCED' ? 'SYNCED' : isReview ? 'PENDING_VERIFICATION' : 'DIGITIZED',
        confidence,
        documentId: docId,
        centroid: [plat, plng],
        coordinates: [
          [plat - 0.0012, plng - 0.0015],
          [plat + 0.0014, plng - 0.0008],
          [plat + 0.001, plng + 0.0018],
          [plat - 0.0013, plng + 0.0012],
        ],
      });
    }
  }

  // Audit Logs
  auditLogs.push(
    {
      id: 'AUDIT-001',
      timestamp: '2026-09-28T16:30:00.000Z',
      user: 'usr-ver-01',
      userName: 'Sunita Deshmukh',
      role: 'VERIFIER',
      action: 'SYNC_COMPLETED',
      entityType: 'INTEGRATION',
      entityId: 'DOC-MH-2026-001',
      after: { lrmsRecordId: 'DILRMP-MH-142-2026', status: 'SYNCED' },
      ip: '10.24.112.54',
      details: 'Pushed verified 7/12 RoR record to DILRMP National Gateway',
    },
    {
      id: 'AUDIT-002',
      timestamp: '2026-09-28T16:25:00.000Z',
      user: 'usr-ver-01',
      userName: 'Sunita Deshmukh',
      role: 'VERIFIER',
      action: 'APPROVED',
      entityType: 'DOCUMENT',
      entityId: 'DOC-MH-2026-001',
      before: { workflowStatus: 'IN_REVIEW' },
      after: { workflowStatus: 'APPROVED' },
      ip: '10.24.112.54',
      details: 'Verified owner name and survey boundaries against Cadastral sheet',
    },
    {
      id: 'AUDIT-003',
      timestamp: '2026-09-28T14:10:00.000Z',
      user: 'usr-op-01',
      userName: 'Ramesh Patil',
      role: 'OPERATOR',
      action: 'UPLOAD',
      entityType: 'DOCUMENT',
      entityId: 'DOC-MH-2026-002',
      after: { fileName: 'Wagholi_Survey_188_Joint_RoR.png', batchId: 'BATCH-2026-001' },
      ip: '10.24.112.12',
      details: 'Uploaded scanned RoR image into Batch BATCH-2026-001',
    },
    {
      id: 'AUDIT-004',
      timestamp: '2026-09-28T14:12:00.000Z',
      user: 'SYSTEM',
      userName: 'AI Engine (Gemini 3.8 Flash)',
      role: 'ADMIN',
      action: 'PROCESS_COMPLETED',
      entityType: 'DOCUMENT',
      entityId: 'DOC-MH-2026-002',
      after: { confidence: 72, qualityScore: 68, workflowStatus: 'IN_REVIEW' },
      ip: '127.0.0.1',
      details: 'Multimodal OCR and structured extraction completed. Flagged for review due to co-owner share uncertainty.',
    }
  );

  // Feedback Records
  feedbackRecords.push({
    id: 'FDB-001',
    documentId: 'DOC-MH-2026-001',
    field: 'parcel.surveyNumber',
    originalValue: '142 / 1',
    correctedValue: '142',
    language: 'Marathi',
    documentType: 'Record of Rights',
    reviewer: 'usr-ver-01',
    reviewerName: 'Sunita Deshmukh',
    confidenceBefore: 78,
    notes: 'Trimmed accidental subdivision delimiter identified as comma in scan margin',
    createdAt: '2026-09-28T16:20:00.000Z',
  });

  // Notifications
  notifications.push(
    {
      id: 'NOTIF-001',
      targetRole: 'VERIFIER',
      title: 'New High Priority Verification Task',
      message: 'Document DOC-MH-2026-002 in Wagholi requires co-owner share review.',
      type: 'WARNING',
      read: false,
      link: '/verification/DOC-MH-2026-002',
      createdAt: '2026-09-28T14:15:00.000Z',
    },
    {
      id: 'NOTIF-002',
      targetRole: 'SUPERVISOR',
      title: 'SLA Warning: 3 Pending Records',
      message: 'Haveli Tehsil has 3 verification tasks approaching the 48-hour SLA deadline.',
      type: 'SLA',
      read: false,
      link: '/supervisor',
      createdAt: '2026-09-28T15:00:00.000Z',
    },
    {
      id: 'NOTIF-003',
      targetRole: 'OPERATOR',
      title: 'Batch Processing Completed',
      message: 'Batch BATCH-2026-002 has finished processing (26 Auto-approved, 4 for Review).',
      type: 'SUCCESS',
      read: true,
      link: '/batches',
      createdAt: '2026-09-27T18:00:00.000Z',
    }
  );

  return {
    documents,
    extractedRecords,
    validationResults,
    gisParcels,
    auditLogs,
    notifications,
    lrmsSyncRecords,
    feedbackRecords,
  };
}
