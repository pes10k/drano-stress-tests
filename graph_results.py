import os
import sys
from boomslang import Plot, Line
import json

data_dir = sys.argv[1]

colors = ('r', 'g', 'b', 'c', 'y', 'm', 'k')

runs = []

for root, dirs, files in os.walk(data_dir):
    records = [a_file for a_file in files if ".json" in a_file]
    for record in records:
        record_handle = open(os.path.join(root, record), 'r')
        client_data = json.load(record_handle)
        record_handle.close()

        client_run = []
        for test in client_data:
            if u'success' in test:
                client_run.append(test[u'end_time'] - test[u'start_time'])
            else:
                client_run.append(0)
        runs.append(client_run)

average_run = [sum(a_run)/len(a_run) for a_run in runs]

plot = Plot()

for run in runs:
    line = Line()
    line.yValues = run
    line.xValues = list(range(0, len(run)))
    plot.add(line)

# Also add in the average line
avg_line = Line()
avg_line.yValues = average_run
avg_line.xValues = list(range(0, len(run)))
avg_line.color = 'r'
plot.add(avg_line)

plot.xLabel = "Test Index"
plot.yLabel = "Miliseconds"
plot.save(os.path.join(data_dir, "graph.png"))
