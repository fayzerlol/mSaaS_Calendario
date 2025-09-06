const { generateEvents } = require('./eventGenerator');

// Mocking Firestore dependency. We are testing the generator logic, not the db connection.
jest.mock('./firebaseConfig', () => ({
  db: {}, // Empty mock
}));
// Mocking the getDocs call to return an empty list of exceptions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
}));


describe('eventGenerator', () => {
  const viewStartDate = new Date('2023-10-01');
  const viewEndDate = new Date('2023-10-31');

  it('should generate a single non-recurring event', async () => {
    const baseEvents = [
      { id: '1', date: '2023-10-15', recurrence: null },
    ];
    const virtualEvents = await generateEvents(baseEvents, viewStartDate, viewEndDate);
    expect(virtualEvents.length).toBe(1);
    expect(virtualEvents[0].virtualDate).toBe('2023-10-15');
  });

  it('should generate daily recurring events', async () => {
    const baseEvents = [
      { id: '1', date: '2023-10-01', recurrence: { type: 'daily', endDate: '2023-10-05' } },
    ];
    const virtualEvents = await generateEvents(baseEvents, viewStartDate, viewEndDate);
    expect(virtualEvents.length).toBe(5);
    expect(virtualEvents.map(e => e.virtualDate)).toEqual([
      '2023-10-01',
      '2023-10-02',
      '2023-10-03',
      '2023-10-04',
      '2023-10-05',
    ]);
  });

  it('should generate weekly recurring events', async () => {
    const baseEvents = [
      { id: '1', date: '2023-10-02', recurrence: { type: 'weekly', endDate: '2023-10-20' } },
    ];
    const virtualEvents = await generateEvents(baseEvents, viewStartDate, viewEndDate);
    expect(virtualEvents.length).toBe(3);
    expect(virtualEvents.map(e => e.virtualDate)).toEqual([
      '2023-10-02',
      '2023-10-09',
      '2023-10-16',
    ]);
  });

  it('should not generate events after the recurrence end date', async () => {
    const baseEvents = [
      { id: '1', date: '2023-10-25', recurrence: { type: 'daily', endDate: '2023-10-28' } },
    ];
    const virtualEvents = await generateEvents(baseEvents, viewStartDate, viewEndDate);
    expect(virtualEvents.length).toBe(4);
  });

  it('should handle events that start before the view but recur into the view', async () => {
    const baseEvents = [
      { id: '1', date: '2023-09-29', recurrence: { type: 'daily', endDate: '2023-10-02' } },
    ];
    const virtualEvents = await generateEvents(baseEvents, viewStartDate, viewEndDate);
    expect(virtualEvents.length).toBe(2); // Should only generate for Oct 1 and Oct 2
    expect(virtualEvents.map(e => e.virtualDate)).toEqual(['2023-10-01', '2023-10-02']);
  });

});
